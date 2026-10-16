<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreJobApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Role dan akses lamaran tetap diperiksa controller.
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'cv' => ['required', 'file', 'mimes:pdf', 'max:5120'],
            'cover_letter' => ['nullable', 'string'],
            'portfolio_url' => ['nullable', 'url', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'cv.required' => 'CV wajib diunggah.',
            'cv.file' => 'CV harus berupa file.',
            'cv.mimes' => 'CV harus dalam format PDF.',
            'cv.max' => 'Ukuran CV maksimal 5 MB.',
        ];
    }

    /**
     * Pertahankan format respons validasi API yang lama.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
                'data' => null,
            ], 422)
        );
    }
}
