import { Form } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <section className="rounded-md border border-red-200 bg-red-50/60 p-5 shadow-sm dark:border-red-200/10 dark:bg-red-700/10">
            <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-100">
                    <AlertTriangle className="size-5" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-red-700 dark:text-red-100">
                        Danger Zone
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Irreversible actions that affect your account and data.
                    </p>
                </div>
            </div>

            <div className="mt-5 border-t border-red-200/60 pt-5 dark:border-red-200/10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-semibold">Delete Account</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Permanently delete your account and associated data.
                            This action cannot be undone.
                        </p>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="destructive"
                                data-test="delete-user-button"
                            >
                                Delete account
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogTitle>
                            Are you sure you want to delete your account?
                        </DialogTitle>
                        <DialogDescription>
                            Once your account is deleted, all of its resources
                            and data will also be permanently deleted. Please
                            enter your password to confirm you would like to
                            permanently delete your account.
                        </DialogDescription>

                            <Form
                                {...ProfileController.destroy.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                onError={() => passwordInput.current?.focus()}
                                resetOnSuccess
                                className="space-y-6"
                            >
                                {({ resetAndClearErrors, processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="password"
                                                className="sr-only"
                                            >
                                                Password
                                            </Label>

                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                ref={passwordInput}
                                                placeholder="Password"
                                                autoComplete="current-password"
                                            />

                                            <InputError message={errors.password} />
                                        </div>

                                        <DialogFooter className="gap-2">
                                            <DialogClose asChild>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() =>
                                                        resetAndClearErrors()
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                            </DialogClose>

                                            <Button
                                                variant="destructive"
                                                disabled={processing}
                                                asChild
                                            >
                                                <button
                                                    type="submit"
                                                    data-test="confirm-delete-user-button"
                                                >
                                                    Delete account
                                                </button>
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </section>
    );
}
