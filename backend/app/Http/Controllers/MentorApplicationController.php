<?php

namespace App\Http\Controllers;

use App\Models\MentorApplication;
use App\Models\MentorApplicationDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Throwable;

class MentorApplicationController extends Controller
{
    /**
     * Melihat riwayat pengajuan mentor milik user yang sedang login.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $applications = MentorApplication::query()
            ->with([
                'industry:id,name',
                'reviewer:id,name,email',
                'documents:id,mentor_application_id,document_type,original_name,mime_type,file_size,created_at',
            ])
            ->where('user_id', $user->id)
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat pengajuan mentor berhasil diambil.',
            'data' => $applications,
        ]);
    }

    /**
     * Mengajukan diri sebagai mentor.
     *
     * Pengajuan menggunakan multipart/form-data karena
     * dapat membawa dokumen verifikasi.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'mentee') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mentee yang dapat mengajukan diri sebagai mentor.',
            ], 403);
        }

        /*
         * Cek apakah user sudah punya pengajuan aktif.
         *
         * pending  = masih menunggu review
         * approved = sudah menjadi mentor
         */
        $activeApplication = MentorApplication::query()
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->latest('id')
            ->first();

        if ($activeApplication) {
            if ($activeApplication->status === 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun kamu sudah terdaftar sebagai mentor.',
                    'data' => $activeApplication,
                ], 422);
            }

            return response()->json([
                'success' => false,
                'message' => 'Kamu masih memiliki pengajuan mentor yang sedang menunggu review admin.',
                'data' => $activeApplication,
            ], 422);
        }

        /*
         * Validasi data aplikasi mentor.
         *
         * Dokumen:
         * - minimal 1
         * - maksimal 3
         * - PDF/JPG/JPEG/PNG
         * - maksimal 5 MB per file
         */
        $validator = Validator::make(
            $request->all(),
            [
                'full_name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'job_title' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'company' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'location' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'experience_years' => [
                    'required',
                    'integer',
                    'min:0',
                    'max:60',
                ],

                'education' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'industry_id' => [
                    'nullable',
                    'integer',
                    'exists:industries,id',
                ],

                'bio' => [
                    'required',
                    'string',
                    'max:3000',
                ],

                'motivation' => [
                    'required',
                    'string',
                    'max:3000',
                ],

                'linkedin_url' => [
                    'nullable',
                    'url',
                    'max:255',
                ],

                'skills' => [
                    'nullable',
                    'array',
                    'max:20',
                ],

                'skills.*' => [
                    'integer',
                    'exists:skills,id',
                ],

                /*
                 * Jenis dokumen.
                 */
                'document_types' => [
                    'required',
                    'array',
                    'min:1',
                    'max:3',
                ],

                'document_types.*' => [
                    'required',
                    'string',
                    'in:certificate,work_experience,portfolio,other',
                ],

                /*
                 * File dokumen.
                 */
                'documents' => [
                    'required',
                    'array',
                    'min:1',
                    'max:3',
                ],

                'documents.*' => [
                    'required',
                    'file',
                    'mimes:pdf,jpg,jpeg,png',
                    'max:5120',
                ],
            ],
            [
                'full_name.required' => 'Nama lengkap wajib diisi.',

                'job_title.required' => 'Jabatan wajib diisi.',

                'experience_years.required' =>
                    'Pengalaman kerja wajib diisi.',

                'experience_years.integer' =>
                    'Pengalaman kerja harus berupa angka.',

                'experience_years.min' =>
                    'Pengalaman kerja tidak boleh negatif.',

                'experience_years.max' =>
                    'Pengalaman kerja maksimal 60 tahun.',

                'industry_id.exists' =>
                    'Industry yang dipilih tidak valid.',

                'bio.required' =>
                    'Bio wajib diisi.',

                'motivation.required' =>
                    'Alasan menjadi mentor wajib diisi.',

                'linkedin_url.url' =>
                    'URL LinkedIn tidak valid.',

                'skills.array' =>
                    'Data skills harus berupa array.',

                'skills.*.integer' =>
                    'ID skill harus berupa angka.',

                'skills.*.exists' =>
                    'Skill yang dipilih tidak valid.',

                'document_types.required' =>
                    'Jenis dokumen wajib dipilih.',

                'document_types.min' =>
                    'Minimal 1 dokumen harus dikirim.',

                'document_types.max' =>
                    'Maksimal 3 dokumen dapat dikirim.',

                'document_types.*.in' =>
                    'Jenis dokumen tidak valid.',

                'documents.required' =>
                    'Dokumen verifikasi wajib diunggah.',

                'documents.min' =>
                    'Minimal 1 dokumen verifikasi wajib diunggah.',

                'documents.max' =>
                    'Maksimal 3 dokumen verifikasi dapat diunggah.',

                'documents.*.file' =>
                    'Setiap bukti verifikasi harus berupa file.',

                'documents.*.mimes' =>
                    'Dokumen hanya boleh berformat PDF, JPG, JPEG, atau PNG.',

                'documents.*.max' =>
                    'Ukuran dokumen maksimal 5 MB per file.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data pengajuan mentor tidak valid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        /*
         * Ambil file dan jenis dokumen.
         */
        $documents = $request->file('documents', []);
        $documentTypes = $request->input('document_types', []);

        /*
         * Pastikan setiap file mempunyai jenis dokumen.
         */
        if (count($documents) !== count($documentTypes)) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Data jenis dokumen tidak sesuai dengan jumlah file yang diunggah.',
                'errors' => [
                    'documents' => [
                        'Setiap dokumen harus memiliki jenis dokumen.',
                    ],
                ],
            ], 422);
        }

        /*
         * Menyimpan path file yang sudah berhasil disimpan.
         *
         * Digunakan untuk cleanup apabila proses database gagal.
         */
        $storedPaths = [];

        try {
            $application = DB::transaction(function () use (
                $user,
                $request,
                $documents,
                $documentTypes,
                &$storedPaths
            ) {
                /*
                 * Buat data pengajuan mentor.
                 */
                $application = MentorApplication::create([
                    'user_id' => $user->id,

                    'full_name' => trim(
                        $request->input('full_name')
                    ),

                    'job_title' => trim(
                        $request->input('job_title')
                    ),

                    'company' => $request->filled('company')
                        ? trim($request->input('company'))
                        : null,

                    'location' => $request->filled('location')
                        ? trim($request->input('location'))
                        : null,

                    'experience_years' => (int) $request->input(
                        'experience_years'
                    ),

                    'education' => $request->filled('education')
                        ? trim($request->input('education'))
                        : null,

                    'industry_id' => $request->input('industry_id'),

                    'bio' => trim(
                        $request->input('bio')
                    ),

                    'motivation' => trim(
                        $request->input('motivation')
                    ),

                    'linkedin_url' => $request->filled('linkedin_url')
                        ? trim($request->input('linkedin_url'))
                        : null,

                    'skills' => $request->input(
                        'skills',
                        []
                    ),

                    'status' => 'pending',

                    'reviewed_by' => null,

                    'rejection_reason' => null,

                    'reviewed_at' => null,
                ]);

                /*
                 * Simpan setiap dokumen.
                 */
                foreach ($documents as $index => $file) {
                    /*
                     * Simpan ke local/private storage.
                     *
                     * File tidak langsung menjadi URL public.
                     */
                    $path = $file->store(
                        "mentor-applications/{$application->id}",
                        'local'
                    );

                    if (!$path) {
                        throw new \RuntimeException(
                            'Gagal menyimpan dokumen verifikasi.'
                        );
                    }

                    $storedPaths[] = $path;

                    /*
                     * Simpan metadata dokumen ke database.
                     */
                    $application->documents()->create([
                        'document_type' => $documentTypes[$index],

                        'original_name' =>
                            $file->getClientOriginalName(),

                        'file_path' => $path,

                        'mime_type' =>
                            $file->getClientMimeType()
                            ?: $file->getMimeType(),

                        'file_size' =>
                            $file->getSize(),
                    ]);
                }

                return $application;
            });

            /*
             * Load relasi setelah transaksi selesai.
             */
            $application->load([
                'industry:id,name',

                'documents:id,mentor_application_id,document_type,original_name,mime_type,file_size,created_at',
            ]);

            return response()->json([
                'success' => true,
                'message' =>
                    'Pengajuan mentor berhasil dikirim dan sedang menunggu review admin.',
                'data' => $application,
            ], 201);
        } catch (Throwable $e) {
            /*
             * Hapus file yang sudah sempat tersimpan
             * apabila transaksi gagal.
             */
            foreach ($storedPaths as $storedPath) {
                Storage::disk('local')->delete($storedPath);
            }

            /*
             * Simpan detail error di Laravel log.
             */
            report($e);

            return response()->json([
                'success' => false,
                'message' =>
                    'Pengajuan mentor gagal disimpan. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * Admin melihat semua pengajuan mentor.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $adminCheck = $this->ensureAdmin($request);

        if ($adminCheck) {
            return $adminCheck;
        }

        $query = MentorApplication::query()
            ->with([
                'user:id,name,email,role,status',

                'industry:id,name',

                'reviewer:id,name,email',

                'documents:id,mentor_application_id,document_type,original_name,mime_type,file_size,created_at',
            ])
            ->latest('id');

        /*
         * Filter status:
         * pending / approved / rejected
         */
        if ($request->filled('status')) {
            $status = strtolower(
                trim($request->input('status'))
            );

            if (!in_array(
                $status,
                ['pending', 'approved', 'rejected'],
                true
            )) {
                return response()->json([
                    'success' => false,
                    'message' => 'Status filter tidak valid.',
                ], 422);
            }

            $query->where(
                'status',
                $status
            );
        }

        /*
         * Pagination.
         */
        $perPage = (int) $request->input(
            'per_page',
            15
        );

        if ($perPage < 1) {
            $perPage = 15;
        }

        if ($perPage > 100) {
            $perPage = 100;
        }

        $applications = $query->paginate(
            $perPage
        );

        return response()->json([
            'success' => true,
            'message' =>
                'Daftar pengajuan mentor berhasil diambil.',

            'data' =>
                $applications->items(),

            'pagination' => [
                'current_page' =>
                    $applications->currentPage(),

                'last_page' =>
                    $applications->lastPage(),

                'per_page' =>
                    $applications->perPage(),

                'total' =>
                    $applications->total(),
            ],
        ]);
    }

    /**
     * Admin menyetujui pengajuan mentor.
     *
     * Proses:
     * 1. application -> approved
     * 2. user role -> mentor
     * 3. user status -> active
     * 4. profile dibuat/diperbarui
     * 5. skills disinkronkan ke mentor_skills
     */
    public function approve(
        Request $request,
        int $id
    ): JsonResponse {
        $adminCheck = $this->ensureAdmin($request);

        if ($adminCheck) {
            return $adminCheck;
        }

        try {
            $application = DB::transaction(
                function () use ($request, $id) {
                    /*
                     * Ambil aplikasi dengan lock.
                     */
                    $application = MentorApplication::query()
                        ->with('user')
                        ->where('id', $id)
                        ->lockForUpdate()
                        ->first();

                    if (!$application) {
                        abort(
                            response()->json([
                                'success' => false,
                                'message' =>
                                    'Pengajuan mentor tidak ditemukan.',
                            ], 404)
                        );
                    }

                    /*
                     * Hanya pending yang boleh di-approve.
                     */
                    if ($application->status !== 'pending') {
                        abort(
                            response()->json([
                                'success' => false,
                                'message' =>
                                    'Hanya pengajuan dengan status pending yang dapat disetujui.',
                                'data' => $application,
                            ], 422)
                        );
                    }

                    $user = $application->user;

                    if (!$user) {
                        abort(
                            response()->json([
                                'success' => false,
                                'message' =>
                                    'User pemilik pengajuan tidak ditemukan.',
                            ], 404)
                        );
                    }

                    /*
                     * Ubah user menjadi mentor aktif.
                     */
                    $user->update([
                        'name' =>
                            $application->full_name,

                        'role' =>
                            'mentor',

                        'status' =>
                            'active',
                    ]);

                    $now = now();

                    /*
                     * Data profile mentor.
                     */
                    $profileData = [
                        'industry_id' =>
                            $application->industry_id,

                        'bio' =>
                            $application->bio,

                        'location' =>
                            $application->location,

                        'job_title' =>
                            $application->job_title,

                        'company' =>
                            $application->company,

                        'experience_years' =>
                            $application->experience_years,

                        'education' =>
                            $application->education,

                        'linkedin_url' =>
                            $application->linkedin_url,

                        'updated_at' =>
                            $now,
                    ];

                    /*
                     * Cek apakah profile sudah ada.
                     */
                    $existingProfile = DB::table(
                        'profiles'
                    )
                        ->where(
                            'user_id',
                            $user->id
                        )
                        ->exists();

                    if ($existingProfile) {
                        /*
                         * Update profile yang sudah ada.
                         */
                        DB::table('profiles')
                            ->where(
                                'user_id',
                                $user->id
                            )
                            ->update(
                                $profileData
                            );
                    } else {
                        /*
                         * Buat profile baru.
                         */
                        DB::table('profiles')->insert([
                            'user_id' =>
                                $user->id,

                            'industry_id' =>
                                $application->industry_id,

                            'bio' =>
                                $application->bio,

                            'location' =>
                                $application->location,

                            'job_title' =>
                                $application->job_title,

                            'company' =>
                                $application->company,

                            'experience_years' =>
                                $application->experience_years,

                            'education' =>
                                $application->education,

                            'linkedin_url' =>
                                $application->linkedin_url,

                            'timezone' =>
                                'Asia/Jakarta',

                            'avg_rating' =>
                                0.00,

                            'total_reviews' =>
                                0,

                            'created_at' =>
                                $now,

                            'updated_at' =>
                                $now,
                        ]);
                    }

                    /*
                     * Sinkronkan skill mentor.
                     */
                    $skills = collect(
                        $application->skills ?? []
                    )
                        ->map(
                            fn ($skillId) =>
                                (int) $skillId
                        )
                        ->filter(
                            fn ($skillId) =>
                                $skillId > 0
                        )
                        ->unique()
                        ->values()
                        ->all();

                    $user->skills()->sync(
                        $skills
                    );

                    /*
                     * Tandai aplikasi sebagai approved.
                     */
                    $application->update([
                        'status' =>
                            'approved',

                        'reviewed_by' =>
                            $request->user()->id,

                        'reviewed_at' =>
                            $now,

                        'rejection_reason' =>
                            null,
                    ]);

                    return $application;
                }
            );

            /*
             * Load data untuk response.
             */
            $application->load([
                'user:id,name,email,role,status',

                'industry:id,name',

                'reviewer:id,name,email',

                'documents:id,mentor_application_id,document_type,original_name,mime_type,file_size,created_at',
            ]);

            return response()->json([
                'success' => true,
                'message' =>
                    'Pengajuan mentor berhasil disetujui. User sekarang terdaftar sebagai mentor.',
                'data' => $application,
            ]);
        } catch (
            \Symfony\Component\HttpFoundation\Response|Throwable $e
        ) {
            /*
             * Jangan ubah response dari abort().
             */
            if (
                $e instanceof
                \Symfony\Component\HttpFoundation\Response
            ) {
                throw $e;
            }

            report($e);

            return response()->json([
                'success' => false,
                'message' =>
                    'Gagal menyetujui pengajuan mentor.',
            ], 500);
        }
    }

    /**
     * Admin menolak pengajuan mentor.
     */
    public function reject(
        Request $request,
        int $id
    ): JsonResponse {
        $adminCheck = $this->ensureAdmin($request);

        if ($adminCheck) {
            return $adminCheck;
        }

        /*
         * Alasan penolakan wajib diberikan.
         */
        $validator = Validator::make(
            $request->all(),
            [
                'rejection_reason' => [
                    'required',
                    'string',
                    'max:3000',
                ],
            ],
            [
                'rejection_reason.required' =>
                    'Alasan penolakan wajib diisi.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Alasan penolakan tidak valid.',
                'errors' =>
                    $validator->errors(),
            ], 422);
        }

        /*
         * Hanya pending yang dapat ditolak.
         */
        $application = MentorApplication::query()
            ->where('id', $id)
            ->where('status', 'pending')
            ->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Pengajuan mentor tidak ditemukan atau sudah diproses.',
            ], 404);
        }

        /*
         * Update status pengajuan.
         */
        $application->update([
            'status' =>
                'rejected',

            'reviewed_by' =>
                $request->user()->id,

            'reviewed_at' =>
                now(),

            'rejection_reason' =>
                trim(
                    $request->input(
                        'rejection_reason'
                    )
                ),
        ]);

        /*
         * Load relasi untuk response.
         */
        $application->load([
            'user:id,name,email,role,status',

            'industry:id,name',

            'reviewer:id,name,email',

            'documents:id,mentor_application_id,document_type,original_name,mime_type,file_size,created_at',
        ]);

        return response()->json([
            'success' => true,
            'message' =>
                'Pengajuan mentor berhasil ditolak.',
            'data' =>
                $application,
        ]);
    }

    /**
     * Admin membuka satu dokumen verifikasi.
     *
     * File disimpan di local/private storage
     * sehingga tidak menjadi URL publik.
     */
    public function viewDocument(
        Request $request,
        int $id,
        int $documentId
    ) {
        /*
         * Hanya admin yang boleh membuka dokumen.
         */
        $adminCheck = $this->ensureAdmin($request);

        if ($adminCheck) {
            return $adminCheck;
        }

        /*
         * Pastikan dokumen benar-benar milik
         * aplikasi mentor yang diminta.
         */
        $document = MentorApplicationDocument::query()
            ->where(
                'id',
                $documentId
            )
            ->where(
                'mentor_application_id',
                $id
            )
            ->first();

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Dokumen verifikasi tidak ditemukan.',
            ], 404);
        }

        /*
         * Gunakan local/private disk.
         */
        $disk = Storage::disk('local');

        /*
         * Pastikan file masih ada.
         */
        if (!$disk->exists($document->file_path)) {
            return response()->json([
                'success' => false,
                'message' =>
                    'File dokumen tidak ditemukan di storage.',
            ], 404);
        }

        /*
         * Kirim file secara inline supaya:
         * - PDF dapat dibuka di browser
         * - gambar dapat dipreview
         */
        return response()->file(
            $disk->path(
                $document->file_path
            ),
            [
                'Content-Type' =>
                    $document->mime_type,

                'Content-Disposition' =>
                    'inline; filename="' .
                    addslashes(
                        $document->original_name
                    ) .
                    '"',

                'X-Content-Type-Options' =>
                    'nosniff',
            ]
        );
    }

    /**
     * Memastikan endpoint hanya dapat diakses admin.
     */
    private function ensureAdmin(
        Request $request
    ): ?JsonResponse {
        $user = $request->user();

        if (
            !$user ||
            $user->role !== 'admin'
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Akses hanya diperbolehkan untuk admin.',
            ], 403);
        }

        return null;
    }
}