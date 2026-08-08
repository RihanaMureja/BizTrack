<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class ChapaService
{
    /**
     * Initialize a Chapa hosted checkout session.
     *
     * @return array{ok: bool, checkout_url?: string|null, reference?: string|null, message?: string}
     */
    public function initialize(string $txRef, float|int $amount, string $email, ?string $firstName = null, ?string $lastName = null): array
    {
        $returnUrl = config('services.chapa.return_url') ?: route('subscriptions.payment.callback');

        try {
            $response = Http::withToken((string) config('services.chapa.secret_key'), 'Bearer')
                ->acceptJson()
                ->post($this->endpoint('/transaction/initialize'), [
                    'amount' => $amount,
                    'currency' => 'ETB',
                    'email' => $email,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'tx_ref' => $txRef,
                    'callback_url' => $returnUrl,
                    'return_url' => $returnUrl,
                ]);
        } catch (ConnectionException) {
            return ['ok' => false, 'message' => 'Unable to reach the payment provider.'];
        }

        if (! $response->successful()) {
            return ['ok' => false, 'message' => $response->json('message') ?? 'Payment initialization failed.'];
        }

        return [
            'ok' => true,
            'checkout_url' => $response->json('data.checkout_url'),
            'reference' => $response->json('data.tx_ref') ?? $txRef,
        ];
    }

    /**
     * Verify a Chapa transaction using its reference.
     *
     * @return array{ok: bool, data?: array<string, mixed>, message?: string}
     */
    public function verify(string $txRef): array
    {
        try {
            $response = Http::withToken((string) config('services.chapa.secret_key'), 'Bearer')
                ->acceptJson()
                ->get($this->endpoint('/transaction/verify/'.$txRef));
        } catch (ConnectionException) {
            return ['ok' => false, 'message' => 'Unable to reach the payment provider.'];
        }

        if (! $response->successful()) {
            return ['ok' => false, 'message' => $response->json('message') ?? 'Payment verification failed.'];
        }

        return [
            'ok' => true,
            'data' => $response->json('data', []),
        ];
    }

    /**
     * A Chapa transaction is confirmed only when both the API status and the
     * inner transaction status report success.
     *
     * @param  array<string, mixed>  $verification
     */
    public function isConfirmed(array $verification): bool
    {
        return ($verification['ok'] ?? false) === true
            && (($verification['data']['status'] ?? null) === 'success');
    }

    private function endpoint(string $path): string
    {
        return rtrim((string) config('services.chapa.base_url'), '/').$path;
    }
}
