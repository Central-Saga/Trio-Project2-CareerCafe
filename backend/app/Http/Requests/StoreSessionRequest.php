<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreSessionRequest extends FormRequest
{
    /**
     * Autentikasi tetap ditangani oleh middleware auth:sanctum
     * dan pemeriksaan role tetap dipertahankan di controller.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan validasi untuk membuat permintaan sesi mentoring.
     */
    public function rules(): array
    {
        return [
            'booked_slot_id' => ['required', 'exists:booked_slots,id'],
            'topic' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:2000'],
            'duration' => ['required', 'integer', 'min:15', 'max:120'],
            'meeting_type' => ['required', 'in:online,offline'],
            'meeting_link' => ['nullable', 'string', 'max:255'],
            'meeting_location' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Pertahankan format error validasi yang digunakan API saat ini.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
