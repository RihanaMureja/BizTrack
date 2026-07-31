<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSecurityQuestionRequest;
use App\Services\SecurityQuestionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SecurityQuestionController extends Controller
{
    public function __construct(private readonly SecurityQuestionService $securityQuestionService) {}

    public function edit(Request $request): Response
    {
        return Inertia::render('settings/security-questions', [
            'questions' => $this->securityQuestionService->activeQuestions(),
            'configuredQuestions' => $request->user()
                ->securityQuestions()
                ->with('question:id,question')
                ->latest()
                ->get(['id', 'user_id', 'security_question_id', 'created_at']),
        ]);
    }

    public function store(StoreSecurityQuestionRequest $request): RedirectResponse
    {
        $this->securityQuestionService->storeAnswer(
            $request->user(),
            (int) $request->validated('security_question_id'),
            $request->validated('answer'),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Security question saved.']);

        return to_route('dashboard');
    }
}
