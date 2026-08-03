<?php

namespace App\Http\Controllers;

use App\Models\Business;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BusinessLogoController extends Controller
{
    public function show(Business $business): StreamedResponse|Response
    {
        $this->authorize('view', $business);

        abort_unless($business->logo, 404);

        $disk = Storage::disk('public');

        abort_unless($disk->exists($business->logo), 404);

        $fileName = basename($business->logo);
        $mimeType = $disk->mimeType($business->logo) ?: 'image/jpeg';

        return $disk->response($business->logo, $fileName, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="'.$fileName.'"',
        ]);
    }
}
