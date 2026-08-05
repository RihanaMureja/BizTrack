import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Head, useForm } from '@inertiajs/react';
import { ShieldQuestion } from 'lucide-react';
import type { FormEvent } from 'react';

type Question = {
    id: number;
    question: string;
};

type ConfiguredQuestion = {
    id: number;
    question: Question;
    created_at: string;
};

type Props = {
    questions: Question[];
    configuredQuestions: ConfiguredQuestion[];
};

export default function SecurityQuestions({ questions, configuredQuestions }: Props) {
    const form = useForm({
        security_question_id: questions[0]?.id ? String(questions[0].id) : '',
        answer: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/settings/security-questions', {
            preserveScroll: true,
            onSuccess: () => form.reset('answer'),
        });
    };

    return (
        <>
            <Head title="Security questions" />
            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Security questions"
                    description="Add an account recovery question that only you can answer."
                />

                <form onSubmit={submit} className="grid gap-5 rounded-md border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <ShieldQuestion className="size-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Recovery question</h2>
                            <p className="text-sm text-muted-foreground">Answers are stored securely and are not shown again.</p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="security_question_id">Question</Label>
                        <select
                            id="security_question_id"
                            value={form.data.security_question_id}
                            onChange={(event) => form.setData('security_question_id', event.target.value)}
                            className="border-input bg-background flex h-10 rounded-md border px-3 text-sm shadow-xs"
                            required
                        >
                            {questions.map((question) => (
                                <option key={question.id} value={question.id}>{question.question}</option>
                            ))}
                        </select>
                        <InputError message={form.errors.security_question_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="answer">Answer</Label>
                        <Input
                            id="answer"
                            value={form.data.answer}
                            onChange={(event) => form.setData('answer', event.target.value)}
                            required
                            autoComplete="off"
                        />
                        <InputError message={form.errors.answer} />
                    </div>

                    <Button type="submit" disabled={form.processing} className="w-fit">
                        {form.processing && <Spinner />}
                        Save security question
                    </Button>
                </form>

                <section className="rounded-md border bg-card p-5 shadow-sm">
                    <h2 className="font-semibold">Configured questions</h2>
                    <div className="mt-4 grid gap-2">
                        {configuredQuestions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No security question has been configured yet.</p>
                        ) : configuredQuestions.map((configured) => (
                            <div key={configured.id} className="rounded-md border bg-background px-3 py-2 text-sm">
                                {configured.question.question}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}

SecurityQuestions.layout = {
    breadcrumbs: [
        { title: 'Security questions', href: '/settings/security-questions' },
    ],
};
