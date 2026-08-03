<?php

namespace App\Http\Controllers;

use App\Models\BusinessVerificationDocument;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BusinessVerificationDocumentController extends Controller
{
    public function show(BusinessVerificationDocument $document): StreamedResponse|Response
    {
        $this->authorize('view', $document->business);

        $disk = Storage::disk('public');

        abort_unless($disk->exists($document->path), 404);

        $fileName = basename($document->path);
        $mimeType = $disk->mimeType($document->path) ?: 'application/octet-stream';

        return $disk->response($document->path, $fileName, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="'.$fileName.'"',
        ]);
    }
}
