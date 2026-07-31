<?php

namespace App\Services;

use App\Models\SecurityQuestion;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;

class SecurityQuestionService
{
    /**
     * @return Collection<int, SecurityQuestion>
     */
    public function activeQuestions(): Collection
    {
        return SecurityQuestion::query()
            ->where('is_active', true)
            ->orderBy('question')
            ->get(['id', 'question']);
    }

    public function storeAnswer(User $user, int $questionId, string $answer): void
    {
        $user->securityQuestions()->updateOrCreate(
            ['security_question_id' => $questionId],
            ['answer_hash' => Hash::make($this->normalizeAnswer($answer))],
        );
    }

    public function verifyAnswer(User $user, int $questionId, string $answer): bool
    {
        $record = $user->securityQuestions()
            ->where('security_question_id', $questionId)
            ->first();

        return $record ? Hash::check($this->normalizeAnswer($answer), $record->answer_hash) : false;
    }

    private function normalizeAnswer(string $answer): string
    {
        return mb_strtolower(trim($answer));
    }
}
