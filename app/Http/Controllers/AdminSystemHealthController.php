<?php

namespace App\Http\Controllers;

use App\Services\SystemHealthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AdminSystemHealthController extends Controller
{
    public function __construct(private readonly SystemHealthService $systemHealthService) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        return Inertia::render('admin/system-health', [
            'health' => $this->systemHealthService->snapshot(),
        ]);
    }

    public function refresh(Request $request): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $this->systemHealthService->snapshot();

        return back()->with('success', 'Health check refreshed.');
    }

    public function sendTestEmail(Request $request): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        try {
            Mail::raw('BizTrack system health test email sent at '.now()->toDateTimeString().'.', function ($message) use ($request): void {
                $message->to($request->user()->email, $request->user()->name)
                    ->subject('BizTrack system health test');
            });

            $this->systemHealthService->recordMailTest(true, 'Test email sent to '.$request->user()->email.'.');

            return back()->with('success', 'Test email sent.');
        } catch (Throwable $exception) {
            $this->systemHealthService->recordMailTest(false, $exception->getMessage());
            $this->systemHealthService->snapshot();

            return back()->with('error', 'Test email failed: '.$exception->getMessage());
        }
    }

    public function testGateway(Request $request, string $gateway): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $result = $this->systemHealthService->testGateway($gateway);

        return back()->with($result['status'] === 'healthy' ? 'success' : 'error', $result['message']);
    }

    public function clearFailedJobs(Request $request): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $count = $this->systemHealthService->clearFailedJobs();
        $this->systemHealthService->snapshot();

        return back()->with('success', $count.' failed job(s) cleared.');
    }
}
