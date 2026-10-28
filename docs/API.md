# Dokumentasi API Career Café

Dokumen ini mencatat API backend Career Café sesuai implementasi aktual di Laravel 13 dengan autentikasi Sanctum dan session-based stateful API. Dokumentasi dibuat berdasarkan pengamatan terhadap `backend/routes/api.php`, `backend/bootstrap/app.php`, request validation, controller, service, resource, dan test autentikasi yang relevan.

## A. Informasi umum

### Tujuan API
API Career Café digunakan untuk:

- mendaftarkan dan mengautentikasi pengguna;
- menampilkan katalog mentor, job, dan career feed publik;
- mengelola profil pengguna dan media profil;
- mengirimkan lamaran pekerjaan dan pengajuan menjadi mentor;
- membuat, menyetujui, menolak, membatalkan, dan menyelesaikan sesi mentoring;
- memberi feedback atas sesi yang telah selesai;
- mengakses data admin yang mencakup mentee, sesi, laporan, dan review mentor application.

### Base URL lokal
Konfigurasi backend proyek setara dengan:

- Backend: `http://localhost:8000`
- Prefix API: `/api/v1`
- Base URL API: `http://localhost:8000/api/v1`

Konfigurasi contoh dari `backend/.env.example` dan root `.env.example`:

- `APP_URL=http://localhost:8000`
- `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api`

Catatan:

- Prefix API yang benar-benar terdaftar adalah `api/v1` karena `backend/bootstrap/app.php` menggunakan `apiPrefix: 'api/v1'`.
- Aplikasi frontend lokal biasanya berjalan di `http://localhost:3000` dan mengirim cookie/session dari origin tersebut.
- Tidak ada alamat produksi resmi yang dijamin dalam repo; dokumen ini membatasi pada lingkungan pengembangan lokal.

### Format data dan header yang didukung
Header yang relevan secara umum:

- `Accept: application/json`
- `Content-Type: application/json` untuk body JSON
- `Origin: http://localhost:3000` saat frontend SPA memanggil API dengan cookie session
- `X-XSRF-TOKEN` saat frontend melakukan request browser stateful seperti Laravel Sanctum SPA

Semua response API berformat JSON dengan envelope standar:

```json
{
  "success": true,
  "message": "Pesan singkat",
  "data": { "...": "..." },
  "pagination": { "current_page": 1, "last_page": 1, "per_page": 15, "total": 20 },
  "errors": null
}
```

Tidak semua endpoint menggunakan `pagination`; beberapa endpoint publik seperti `/jobs` dan `/industries` mengembalikan `data` langsung sebagai array. Untuk endpoint yang paginasi, kunci `pagination` disertakan.

### Autentikasi yang benar-benar dipakai
Implementasi yang terdeteksi di kode adalah Laravel Sanctum dengan stateful API dan guard `web`:

- `backend/bootstrap/app.php` memanggil `$middleware->statefulApi();`
- `backend/config/sanctum.php` menggunakan `guard => ['web']`
- `SANCTUM_STATEFUL_DOMAINS` default mencakup `localhost:3000`, `127.0.0.1:3000`, dan port 8000 terkait.
- `login` dan `register` memanggil `Auth::guard('web')->login($user);` dan regenerasi session.
- Response login/register tidak mengembalikan `token` di `data`; sesi cookie HTTP-only yang diset oleh Laravel adalah mekanisme autentikasi utama untuk frontend.

Untuk browser/SPA:

1. panggil `GET /sanctum/csrf-cookie` dari origin frontend agar cookie `XSRF-TOKEN` dibuat;
2. kirim request JSON ke endpoint autentikasi; cookie session akan disimpan otomatis oleh browser;
3. gunakan cookie session untuk request ke endpoint yang dilindungi.

Untuk client non-browser, Sanctum bearer token juga tetap didukung bila dibuat secara manual oleh aplikasi atau client, tetapi repository saat ini tidak menyediakan endpoint issuance token yang menghasilkan token di JSON response.

### CSRF dan session cookie
Backend mengharuskan request browser dari `Origin` yang masuk daftar `SANCTUM_STATEFUL_DOMAINS` untuk mendapatkan `Access-Control-Allow-Origin` dan cookie sesi. Endpoint `GET /sanctum/csrf-cookie` akan membuat cookie `XSRF-TOKEN` dan menetapkan `Access-Control-Allow-Credentials: true` untuk origin frontend.

Pada request yang menggunakan cookie session, backend menonaktifkan akses tanpa session untuk endpoint yang memerlukan `auth:sanctum`.

## B. Konvensi request dan response

### Request
- Body JSON untuk operasi create/update.
- `POST`, `PUT`, `PATCH` menggunakan JSON; `FormData` dipakai untuk upload file seperti `photo`, `cover`, `cv`, `documents`.
- Untuk upload file, validasi di `FormRequest` memeriksa `file`, `image`, `mimes`, dan ukuran maksimal.
- Banyak endpoint yang dibatasi `throttle` (misalnya login/register 5 req/minute; photo/cover 10 req/min; session feedback 5 req/min).

### Response sukses
Struktur umum untuk sebagian besar endpoint:

```json
{
  "success": true,
  "message": "Pesan singkat",
  "data": {...}
}
```

Untuk list paginated, ditambahkan kunci `pagination`:

```json
{
  "success": true,
  "message": "Daftar ... berhasil diambil.",
  "data": [
    { "id": 1 }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 42
  }
}
```

### Response error
Error pada Laravel disesuaikan di `backend/bootstrap/app.php` dengan struktur berikut:

```json
{
  "success": false,
  "message": "Validasi gagal.",
  "data": null,
  "errors": {
    "email": ["The email field is required."]
  }
}
```

Pola status yang umum:

- `200 OK` untuk operasi read/success biasa
- `201 Created` untuk register/login berhasil, lamaran job, pengajuan mentor, dan pembuatan postingan/sesi
- `204` tidak digunakan secara eksplisit dalam route API saat ini
- `400` untuk kondisi bisnis yang gagal saat service layer memeriksa state/transaksi
- `401` untuk `Unauthenticated.`
- `403` untuk akses ditolak atau role tidak sesuai
- `404` untuk resource tidak ditemukan
- `409` untuk konflik / slot tidak tersedia
- `422` untuk validasi atau state invalid seperti duplikasi lamaran, session tidak bisa diubah, alasan penolakan kosong, atau sesi bukan completed
- `429` untuk rate limit throttle
- `500` untuk exception tak tertangkap

## C. Autentikasi dan sesi

### 1. `GET /sanctum/csrf-cookie`
Endpoint ini dipanggil sebelum request SPA ke endpoint yang membutuhkan cookie session.

```bash
curl -i -X GET http://localhost:8000/sanctum/csrf-cookie \
  -H 'Origin: http://localhost:3000'
```

Response sukses biasanya `204 No Content` dan header `Access-Control-Allow-Credentials: true` serta cookie `XSRF-TOKEN`.

### 2. `POST /api/v1/register`
Role default adalah `mentee` bila `role` tidak dikirim.

Body:

```json
{
  "name": "Ayu Putri",
  "email": "ayu@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "role": "mentee"
}
```

Validasi:

- `name`: required, string, 2-255 karakter
- `email`: required, email, unique di `users.email`
- `password`: required, string, min 8, `confirmed`
- `role`: nullable, `mentee` atau `mentor`

Response `201`:

```json
{
  "success": true,
  "message": "Pendaftaran berhasil.",
  "data": {
    "user": {
      "id": 12,
      "name": "Ayu Putri",
      "email": "ayu@example.com",
      "role": "mentee",
      "profile": {
        "timezone": "Asia/Jakarta",
        "avg_rating": 0,
        "total_reviews": 0
      }
    }
  }
}
```

Catatan: login/register membentuk session HTTP-only, bukan token yang muncul di JSON. `data.token` tidak ada.

### 3. `POST /api/v1/login`
Body:

```json
{
  "email": "ayu@example.com",
  "password": "SecurePass123!"
}
```

Validasi:

- `email`: required, email
- `password`: required, string

Response `200` sukses:

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": 12,
      "name": "Ayu Putri",
      "email": "ayu@example.com",
      "role": "mentee",
      "profile": {
        "timezone": "Asia/Jakarta",
        "avg_rating": 0,
        "total_reviews": 0
      }
    }
  }
}
```

Jika kredensial salah:

```json
{
  "success": false,
  "message": "Email atau kata sandi tidak sesuai.",
  "errors": {
    "email": ["Kredensial yang diberikan tidak cocok dengan data kami."]
  }
}
```

### 4. `POST /api/v1/logout` dan `POST /api/v1/logout-all`
Keduanya memerlukan autentikasi dan menghapus session/token sesuai konteks.

- `logout`: menonaktifkan token aktif dan sesi saat ini
- `logout-all`: menghapus semua token dan session milik user

Response umum:

```json
{
  "success": true,
  "message": "Logout berhasil.",
  "data": null
}
```

### 5. `GET /api/v1/me`
Mengembalikan user yang sedang login beserta relasi profil dan skills.

Response umum:

```json
{
  "success": true,
  "message": "Data pengguna berhasil diambil.",
  "data": {
    "id": 12,
    "name": "Ayu Putri",
    "email": "ayu@example.com",
    "role": "mentee",
    "profile": { ... },
    "skills": []
  }
}
```

## D. Daftar lengkap endpoint

### D1. Endpoint publik / discovery

| Method | Endpoint | Authentication / Role | Request | Response sukses | HTTP status |
|---|---|---|---|---|---|
| GET | `/api/v1/industries` | Publik | - | `data: [industry]` | 200 |
| GET | `/api/v1/skills` | Publik | - | `data: [skill]` | 200 |
| GET | `/api/v1/jobs` | Publik | - | `data: [JobResource]` | 200 |
| GET | `/api/v1/jobs/{id}` | Publik | path `id` | `data: JobResource` | 200 / 404 |
| GET | `/api/v1/mentors` | Publik | query `search`, `industry`, `skill`, `min_exp`, `max_exp`, `per_page`, `page` | `data: [MentorResource], pagination` | 200 |
| GET | `/api/v1/mentors/{id}` | Publik | path `id` | `data: MentorResource` | 200 / 404 |
| GET | `/api/v1/mentors/{id}/availability` | Publik | path `id` | `data: [AvailabilityResource]` | 200 / 404 |
| GET | `/api/v1/mentors/{id}/slots` | Publik | path `id`, query `from`, `to` | `data: [MentorSlotResource]` | 200 / 404 |
| GET | `/api/v1/mentors/{id}/feedbacks` | Publik | path `id` | `data: [FeedbackResource]` | 200 |
| GET | `/api/v1/posts` | Publik | query `category`, `search`, `per_page`, `page` | `data: [PostResource], pagination` | 200 |
| GET | `/api/v1/posts/{id}` | Publik | path `id` | `data: PostResource` | 200 / 404 |

### D2. Endpoint autentikasi dan profil

| Method | Endpoint | Authentication / Role | Request | Response sukses | HTTP status |
|---|---|---|---|---|---|
| POST | `/api/v1/register` | Publik | body `name,email,password,password_confirmation,role` | `data.user` | 201 / 422 |
| POST | `/api/v1/login` | Publik | body `email,password` | `data.user` | 200 / 401 / 403 / 422 |
| POST | `/api/v1/logout` | Authenticated | session/cookie/token | `data: null` | 200 |
| POST | `/api/v1/logout-all` | Authenticated | session/cookie/token | `data: null` | 200 |
| GET | `/api/v1/me` | Authenticated | - | `data: UserResource` | 200 / 401 |
| GET | `/api/v1/profile` | Authenticated | - | `data: ProfileOverviewResource` | 200 |
| PUT | `/api/v1/profile` | Authenticated | body profil (opsional) | `data: UserResource` | 200 / 422 |
| POST | `/api/v1/profile/photo` | Authenticated | form-data `photo` | `data.profile_photo` | 200 / 422 |
| DELETE | `/api/v1/profile/photo` | Authenticated | - | `data.profile_photo: null` | 200 |
| POST | `/api/v1/profile/cover` | Authenticated | form-data `cover` | `data.cover_photo` | 200 / 422 |
| DELETE | `/api/v1/profile/cover` | Authenticated | - | `data.cover_photo: null` | 200 |

### D3. Endpoint job, lamaran, mentor application, sesi, dan feedback

| Method | Endpoint | Authentication / Role | Request | Response sukses | HTTP status |
|---|---|---|---|---|---|
| POST | `/api/v1/jobs/{jobId}/apply` | Authenticated, role `mentee` | form-data/file `cv`, `full_name`, `email`, `phone`, `cover_letter`, `portfolio_url` | `data: JobApplicationResource` | 201 / 403 / 404 / 422 |
| GET | `/api/v1/applications` | Authenticated, role `mentee` | - | `data: [JobApplicationResource]` | 200 / 403 |
| GET | `/api/v1/mentor-applications/my` | Authenticated | - | `data: [MentorApplicationResource]` | 200 |
| POST | `/api/v1/mentor-applications` | Authenticated, role `mentee` | form-data `full_name`, `job_title`, ... `documents[]`, `document_types[]` | `data: MentorApplicationResource` | 201 / 403 / 422 |
| POST | `/api/v1/availability` | Authenticated, role `mentor` | body `availabilities[]` | `data: [AvailabilityResource]` | 200 / 403 / 422 |
| POST | `/api/v1/sessions` | Authenticated, role `mentee` | body `booked_slot_id`, `topic`, `message`, `duration`, `meeting_type`, `meeting_link`, `meeting_location` | `data: SessionResource` | 201 / 403 / 409 / 422 |
| GET | `/api/v1/sessions` | Authenticated | query `tab`, `status`, `per_page`, `page` | `data: [SessionResource], pagination` | 200 |
| GET | `/api/v1/sessions/{id}` | Authenticated, policy-based | path `id` | `data: SessionResource` | 200 / 403 / 404 |
| PATCH | `/api/v1/sessions/{id}/approve` | Authenticated, role `mentor` atas sesi | path `id` | `data: SessionResource` | 200 / 403 / 404 / 422 |
| PATCH | `/api/v1/sessions/{id}/reject` | Authenticated, role `mentor` atas sesi | path `id`, body `rejection_reason` | `data: SessionResource` | 200 / 403 / 404 / 422 |
| PATCH | `/api/v1/sessions/{id}/cancel` | Authenticated, role sesuai policy | path `id` | `data: SessionResource` | 200 / 403 / 404 / 422 |
| PATCH | `/api/v1/sessions/{id}/complete` | Authenticated, role `mentor` atas sesi | path `id` | `data: SessionResource` | 200 / 403 / 404 / 422 |
| POST | `/api/v1/sessions/{id}/feedback` | Authenticated, role `mentee` untuk session completed | path `id`, body `rating`, `comment` | `data: FeedbackResource` | 201 / 403 / 404 / 422 |
| POST | `/api/v1/posts` | Authenticated, permission by gate | body `title`, `content`, `category`, `status` | `data: PostResource` | 201 / 403 / 422 |
| PUT | `/api/v1/posts/{id}` | Authenticated, owner/admin sesuai policy | body update post | `data: PostResource` | 200 / 403 / 404 / 422 |
| DELETE | `/api/v1/posts/{id}` | Authenticated, owner/admin sesuai policy | path `id` | `data: null` | 200 / 403 / 404 |

### D4. Endpoint admin

| Method | Endpoint | Authentication / Role | Request | Response sukses | HTTP status |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/mentor-applications` | Authenticated, role `admin` | query `status` | `data: [MentorApplicationResource], pagination` | 200 / 403 / 422 |
| PATCH | `/api/v1/admin/mentor-applications/{id}/approve` | Authenticated, role `admin` | path `id` | `data: MentorApplicationResource` | 200 / 403 / 404 / 422 |
| PATCH | `/api/v1/admin/mentor-applications/{id}/reject` | Authenticated, role `admin` | path `id`, body `rejection_reason` | `data: MentorApplicationResource` | 200 / 403 / 404 / 422 |
| GET | `/api/v1/admin/mentor-applications/{id}/documents/{documentId}` | Authenticated, role `admin` | path `id`, `documentId` | `data: document` / file metadata | 200 / 403 / 404 |
| GET | `/api/v1/admin/mentees` | Authenticated, role `admin` | query `page`, `per_page`, filter lainnya sesuai query | `data: [AdminMenteeResource], pagination` | 200 / 403 / 422 |
| GET | `/api/v1/admin/mentees/{id}` | Authenticated, role `admin` | path `id` | `data: AdminMenteeResource` | 200 / 403 / 404 |
| GET | `/api/v1/admin/sessions` | Authenticated, role `admin` | - | `data: [AdminSessionResource], stats, pagination` | 200 / 403 |
| GET | `/api/v1/admin/sessions/{id}` | Authenticated, role `admin` | path `id` | `data: AdminSessionResource` | 200 / 403 / 404 |
| PATCH | `/api/v1/admin/sessions/{id}/complete` | Authenticated, role `admin` | path `id` | `data: AdminSessionResource` | 200 / 403 / 404 / 422 |
| GET | `/api/v1/admin/reports` | Authenticated, role `admin` | - | `data: AdminReportResource` | 200 / 403 |

## E. Detail request dan response

### 1. Endpoint publik: jobs
`GET /api/v1/jobs` memberi daftar lowongan aktif.

- `Job` memiliki field seperti `id`, `title`, `company`, `location`, `type`, `category`, `skills`, `description`, `salary`, `posted_at`, `is_active`.
- Response sukses:

```json
{
  "success": true,
  "message": "Daftar lowongan berhasil diambil.",
  "data": [
    {
      "id": 1,
      "title": "Frontend Engineer",
      "company": "Career Café",
      "location": "Remote",
      "type": "full-time",
      "category": "Technology",
      "skills": ["React", "TypeScript"],
      "salary": "Rp 12.000.000",
      "posted_at": "2026-10-28T10:00:00.000000Z"
    }
  ]
}
```

`GET /api/v1/jobs/{id}` mengembalikan `JobResource` untuk lowongan aktif. Bila tidak ada atau tidak aktif, response `404` dengan:

```json
{
  "success": false,
  "message": "Lowongan tidak ditemukan.",
  "data": null
}
```

### 2. Endpoint publik: mentors dan pencarian
`GET /api/v1/mentors` mendukung filter berikut:

- `search`: pencarian berdasarkan nama, judul pekerjaan, perusahaan, bio, industry, atau skill
- `industry`: `id` atau nama industry
- `skill`: `id` atau nama skill
- `min_exp`: integer minimum pengalaman
- `max_exp`: integer maksimum pengalaman
- `page`: halaman
- `per_page`: jumlah item per halaman, default 15, maksimum 100

Response `pagination` selalu tersedia untuk list paginated.

### 3. Endpoint sesi mentoring
`POST /api/v1/sessions` menerima payload:

```json
{
  "booked_slot_id": 7,
  "topic": "Career path untuk backend engineer",
  "message": "Saya ingin berdiskusi tentang roadmap karier.",
  "duration": 60,
  "meeting_type": "online",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "meeting_location": null
}
```

Validasi:

- `booked_slot_id` required, exists di `booked_slots.id`
- `topic` required string max 255
- `message` required string max 2000
- `duration` required integer min 15 max 120
- `meeting_type` required `online` atau `offline`
- `meeting_link` nullable string max 255
- `meeting_location` nullable string max 255

Status sesi yang terdeteksi di service layer:

- `pending`
- `approved`
- `rejected`
- `cancelled`
- `completed`
- `expired` (disebutkan di query, bukan di route khusus)

Flow bisnis yang valid:

- mentee membuat sesi -> status `pending`
- mentor memutuskan `approve`/`reject`
- mentor memutuskan `complete` setelah sesi disetujui
- mentee dapat memberi feedback hanya bila session `completed`

### 4. Endpoint aplikasi pekerjaan
`POST /api/v1/jobs/{jobId}/apply` memerlukan `full_name`, `email`, `cv`, opsional `phone`, `cover_letter`, `portfolio_url`.

Validasi:

- `full_name` required string max 255
- `email` required email max 255
- `phone` nullable string max 50
- `cv` required file PDF max 5 MB
- `cover_letter` nullable string
- `portfolio_url` nullable URL max 255

Akses:

- hanya authenticated `mentee`
- hanya untuk lowongan aktif
- mencegah duplikasi lamaran pada job yang sama dengan `422`.

### 5. Endpoint mentor application
`POST /api/v1/mentor-applications` menerima payload kompleks:

```json
{
  "full_name": "Ayu Putri",
  "job_title": "Backend Engineer",
  "company": "PT Teknologi Nusantara",
  "location": "Jakarta",
  "experience_years": 5,
  "education": "S1 Informatika",
  "industry_id": 2,
  "bio": "Lorem ipsum",
  "motivation": "Saya ingin membagikan pengalaman ...",
  "linkedin_url": "https://www.linkedin.com/in/ayuputri",
  "skills": [1, 5, 9],
  "document_types": ["certificate", "work_experience"],
  "documents": ["file1.pdf", "file2.pdf"]
}
```

Validasi:

- `full_name`, `job_title`, `experience_years`, `bio`, `motivation` required
- `industry_id` optional integer exists di `industries.id`
- `skills.*` integer exists di `skills.id`
- `document_types` required array min 1 max 3; nilai yang diizinkan: `certificate`, `work_experience`, `portfolio`, `other`
- `documents` required array min 1 max 3; file PDF/JPG/JPEG/PNG max 5 MB

Jika `document_types` dan `documents` jumlahnya tidak sama, controller mengembalikan 422 dengan message:

```json
{
  "success": false,
  "message": "Data jenis dokumen tidak sesuai dengan jumlah file yang diunggah.",
  "errors": {
    "documents": ["Setiap dokumen harus memiliki jenis dokumen."]
  }
}
```

### 6. Endpoint media profil
Upload foto profil dan cover профiil memerlukan `multipart/form-data` dengan field `photo` atau `cover` dan file image `jpg`, `jpeg`, `png`, atau `webp`, max 2 MB.

Response sukses umum:

```json
{
  "success": true,
  "message": "Foto profil berhasil diunggah.",
  "data": {
    "profile_photo": "/storage/profile/photo.jpg"
  }
}
```

Delete foto/cover mengembalikan `data` dengan nilai `null`.

## F. Status HTTP dan error

### Error autentikasi
Jika request tidak membawa session/token yang valid untuk endpoint yang dibatasi:

```json
{
  "success": false,
  "message": "Unauthenticated.",
  "data": null,
  "errors": null
}
```

Status: `401`.

### Error otorisasi
Contoh ketika role tidak sesuai:

```json
{
  "success": false,
  "message": "Hanya mentee yang dapat melihat daftar lamaran pekerjaan.",
  "data": null
}
```

Status: `403`.

### Error validasi
Validation error menggunakan `422`:

```json
{
  "success": false,
  "message": "Validasi gagal.",
  "errors": {
    "booked_slot_id": ["The booked slot id field is required."]
  }
}
```

### Error resource tidak ditemukan
Status `404` dengan pesan seperti:

```json
{
  "success": false,
  "message": "Sesi tidak ditemukan.",
  "data": null
}
```

### Error konflik / state invalid
Beberapa service memaksa `409` maupun `422` untuk kondisi bisnis tertentu, misalnya:

- slot sudah dipakai, `409` (`The selected slot is no longer available.`)
- member sudah melamar pekerjaan yang sama, `422`
- sesi bukan status yang diizinkan untuk berubah, `422`
- pengajuan mentor sudah ada, `422`

## G. Contoh request yang bisa digunakan

### 1. Contoh login dengan session cookie
```bash
curl -i -X GET http://localhost:8000/sanctum/csrf-cookie \
  -H 'Origin: http://localhost:3000' \
  -c cookies.txt

curl -i -X POST http://localhost:8000/api/v1/login \
  -H 'Origin: http://localhost:3000' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-XSRF-TOKEN: <value-from-cookie>' \
  -b cookies.txt -c cookies.txt \
  -d '{
    "email": "trioriawan@example.com",
    "password": "password123"
  }'
```

Setelah login, request berikut akan membawa cookie session otomatis:

```bash
curl -i http://localhost:8000/api/v1/me \
  -H 'Accept: application/json' \
  -b cookies.txt
```

### 2. Contoh CRUD utama: jobs / applications / sessions
Operasi publik:

```bash
curl http://localhost:8000/api/v1/jobs \
  -H 'Accept: application/json'
```

Lamaran job (mentee):

```bash
curl -X POST http://localhost:8000/api/v1/jobs/1/apply \
  -H 'Accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -b cookies.txt \
  -F 'full_name=John Doe' \
  -F 'email=john@example.com' \
  -F 'phone=081234567890' \
  -F 'cv=@/path/to/cv.pdf' \
  -F 'cover_letter=I am interested in this position.'
```

Pembuatan sesi mentoring (mentee):

```bash
curl -X POST http://localhost:8000/api/v1/sessions \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{
    "booked_slot_id": 7,
    "topic": "Roadmap ke senior backend engineer",
    "message": "Saya ingin belajar strategi mentoring dan technical growth.",
    "duration": 60,
    "meeting_type": "online",
    "meeting_link": "https://meet.google.com/abc-defg-hij"
  }'
```

### 3. Contoh autentikasi untuk endpoint terlindungi dengan cookie session
Setelah login, semua endpoint `auth:sanctum` dapat dipanggil dengan cookie yang dikirim oleh browser. Untuk request `curl`, gunakan `-b cookies.txt` atau `Authorization: Bearer <token>` bila token tersedia.

## H. Contoh error

### Error login salah
```json
{
  "success": false,
  "message": "Email atau kata sandi tidak sesuai.",
  "errors": {
    "email": ["Kredensial yang diberikan tidak cocok dengan data kami."]
  }
}
```

### Error validasi form profile
```json
{
  "success": false,
  "message": "Validasi pembaruan profil gagal.",
  "errors": {
    "linkedin_url": ["The linkedin url field must be a valid URL address."]
  }
}
```

### Error akses ditolak
```json
{
  "success": false,
  "message": "Hanya mentor yang dapat mengatur ketersediaan.",
  "data": null
}
```

## I. Catatan implementasi dan batasan

- Endpoint `GET /api/v1/mentors/{id}/slots` memanggil `generateConcreteSlotsForMentor($mentorId, 4)` saat request masuk, sehingga hasil slot selalu dibuat ulang untuk rentang 4 minggu ke depan.
- `jobs` endpoint tidak menerapkan pagination; ia memanggil `allActive()` dan mengembalikan seluruh lowongan aktif.
- `posts` endpoint adalah komunitas publik dan difilter berdasarkan kategori dan pencarian.
- Source of truth untuk seluruh endpoint adalah file `backend/routes/api.php` dan `backend/bootstrap/app.php`; dokumentasi ini mengikuti implementasi tersebut dan tidak menambahkan endpoint yang tidak ada di route list.
- `Route::get('/', ...)` di `backend/routes/web.php` bukan endpoint API, jadi tidak termasuk dalam dokumentasi API.
- `GET /up` merupakan health check Laravel dan tidak termasuk sebagai endpoint fitur bisnis.

## J. Checklist kelengkapan

Dokumen ini mencakup endpoint berikut:

- endpoint publik discovery: industri, skill, jobs, mentors, slots, feedback publik, posts public
- semua endpoint autentikasi: register, login, logout, logout-all, me, CSRF
- semua endpoint profile/media
- semua endpoint pekerjaan, mentor application, session, feedback, post
- semua endpoint admin: mentor application review, mentees, sessions, reports

Dokumentasi ini bersifat manual, mengikuti implementasi aktuaI backend tanpa menambahkan dependency baru seperti Swagger/OpenAPI.
