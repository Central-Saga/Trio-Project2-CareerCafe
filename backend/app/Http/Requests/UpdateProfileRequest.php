<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route sudah dilindungi middleware auth:sanctum.
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'min:2', 'max:255'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'location' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'string', 'url', 'max:255'],
            'timezone' => ['nullable', 'string', 'max:100'],

            'job_title' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'industry_id' => ['nullable', 'exists:industries,id'],
            'experience_years' => [
                'nullable',
                'integer',
                'min:0',
                'max:60',
            ],
            'education' => ['nullable', 'string', 'max:255'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:50'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validasi pembaruan profil gagal.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
