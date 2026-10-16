<?php

namespace App\Http\Requests;

use App\Models\MentorApplication;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreMentorApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (!$user || $user->role !== 'mentee') {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Hanya mentee yang dapat mengajukan diri sebagai mentor.',
                ], 403)
            );
        }

        $activeApplication = MentorApplication::query()
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->latest('id')
            ->first();

        if ($activeApplication) {
            if ($activeApplication->status === 'approved') {
                throw new HttpResponseException(
                    response()->json([
                        'success' => false,
                        'message' => 'Akun kamu sudah terdaftar sebagai mentor.',
                        'data' => $activeApplication,
                    ], 422)
                );
            }

            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Kamu masih memiliki pengajuan mentor yang sedang menunggu review admin.',
                    'data' => $activeApplication,
                ], 422)
            );
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'job_title' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'experience_years' => ['required', 'integer', 'min:0', 'max:60'],
            'education' => ['nullable', 'string', 'max:255'],
            'industry_id' => ['nullable', 'integer', 'exists:industries,id'],
            'bio' => ['required', 'string', 'max:3000'],
            'motivation' => ['required', 'string', 'max:3000'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'skills' => ['nullable', 'array', 'max:20'],
            'skills.*' => ['integer', 'exists:skills,id'],
            'document_types' => ['required', 'array', 'min:1', 'max:3'],
            'document_types.*' => [
                'required',
                'string',
                'in:certificate,work_experience,portfolio,other',
            ],
            'documents' => ['required', 'array', 'min:1', 'max:3'],
            'documents.*' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:5120',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'job_title.required' => 'Jabatan wajib diisi.',
            'experience_years.required' => 'Pengalaman kerja wajib diisi.',
            'experience_years.integer' => 'Pengalaman kerja harus berupa angka.',
            'experience_years.min' => 'Pengalaman kerja tidak boleh negatif.',
            'experience_years.max' => 'Pengalaman kerja maksimal 60 tahun.',
            'industry_id.exists' => 'Industry yang dipilih tidak valid.',
            'bio.required' => 'Bio wajib diisi.',
            'motivation.required' => 'Alasan menjadi mentor wajib diisi.',
            'linkedin_url.url' => 'URL LinkedIn tidak valid.',
            'skills.array' => 'Data skills harus berupa array.',
            'skills.*.integer' => 'ID skill harus berupa angka.',
            'skills.*.exists' => 'Skill yang dipilih tidak valid.',
            'document_types.required' => 'Jenis dokumen wajib dipilih.',
            'document_types.min' => 'Minimal 1 dokumen harus dikirim.',
            'document_types.max' => 'Maksimal 3 dokumen dapat dikirim.',
            'document_types.*.in' => 'Jenis dokumen tidak valid.',
            'documents.required' => 'Dokumen verifikasi wajib diunggah.',
            'documents.min' => 'Minimal 1 dokumen verifikasi wajib diunggah.',
            'documents.max' => 'Maksimal 3 dokumen verifikasi dapat diunggah.',
            'documents.*.file' => 'Setiap bukti verifikasi harus berupa file.',
            'documents.*.mimes' => 'Dokumen hanya boleh berformat PDF, JPG, JPEG, atau PNG.',
            'documents.*.max' => 'Ukuran dokumen maksimal 5 MB per file.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Data pengajuan mentor tidak valid.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
