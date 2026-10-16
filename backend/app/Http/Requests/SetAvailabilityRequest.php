<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class SetAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'mentor';
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Hanya mentor yang dapat mengatur ketersediaan.',
            ], 403)
        );
    }

    public function rules(): array
    {
        return [
            'availabilities' => ['required', 'array'],
            'availabilities.*.day_of_week' => [
                'required',
                'integer',
                'between:0,6',
            ],
            'availabilities.*.start_time' => [
                'required',
                'date_format:H:i',
            ],
            'availabilities.*.end_time' => [
                'required',
                'date_format:H:i',
                'after:availabilities.*.start_time',
            ],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Format ketersediaan mingguan tidak valid.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
