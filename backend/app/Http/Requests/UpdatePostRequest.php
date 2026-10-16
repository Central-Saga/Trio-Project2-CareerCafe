<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization kepemilikan postingan akan ditangani oleh Policy.
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'content' => ['sometimes', 'required', 'string', 'min:10'],
            'category' => [
                'sometimes',
                'required',
                'string',
                Rule::in([
                    'Career Story',
                    'Industry Insight',
                    'Interview Tips',
                    'Work Experience',
                    'Networking Tips',
                ]),
            ],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validasi pembaruan postingan gagal.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
