<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization akan ditangani oleh middleware dan Policy.
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'content' => ['required', 'string', 'min:10'],
            'category' => [
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
                'message' => 'Validasi postingan gagal.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
