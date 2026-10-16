<?php

namespace App\Http\Requests;

use App\Models\Feedback;
use App\Models\Session;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        $session = Session::find($this->route('sessionId') ?? $this->route('id'));

        if (!$session) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Sesi tidak ditemukan.',
                ], 404)
            );
        }

        if ($session->status !== 'completed') {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Feedback hanya dapat diberikan untuk sesi yang telah selesai (completed).',
                ], 422)
            );
        }

        if ((int) $session->mentee_id !== (int) $this->user()?->id) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Hanya mentee peserta sesi yang dapat memberikan ulasan.',
                ], 403)
            );
        }

        if (Feedback::where('session_id', $session->id)->exists()) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Anda sudah memberikan feedback untuk sesi ini.',
                ], 422)
            );
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validasi rating gagal.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
