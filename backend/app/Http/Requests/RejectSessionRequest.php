<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RejectSessionRequest extends FormRequest
{
    /**
     * Authorization sesi tetap diperiksa oleh SessionPolicy
     * di dalam SessionController.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan validasi alasan penolakan sesi mentoring.
     */
    public function rules(): array
    {
        return [
            'rejection_reason' => [
                'required',
                'string',
                'min:5',
                'max:3000',
            ],
        ];
    }

    /**
     * Pertahankan pesan validasi yang digunakan API saat ini.
     */
    public function messages(): array
    {
        return [
            'rejection_reason.required' => 'Alasan penolakan wajib diisi.',
            'rejection_reason.min' => 'Alasan penolakan minimal 5 karakter.',
            'rejection_reason.max' => 'Alasan penolakan maksimal 3000 karakter.',
        ];
    }

    /**
     * Pertahankan format respons error JSON yang lama.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Alasan penolakan tidak valid.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
