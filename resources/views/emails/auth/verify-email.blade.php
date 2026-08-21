<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verify your BizTrack email</title>
</head>
<body style="margin:0;background:#f3f8f5;color:#0f1f1a;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f8f5;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;">
                    <tr>
                        <td align="center" style="padding:8px 0 24px;">
                            <img src="{{ $logoUrl }}" alt="BizTrack" width="150" style="display:block;max-width:150px;height:auto;border:0;">
                        </td>
                    </tr>
                    <tr>
                        <td style="overflow:hidden;border:1px solid #d8e8df;border-radius:22px;background:#ffffff;box-shadow:0 18px 50px rgba(13,70,49,0.10);">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="background:#006b3f;padding:26px 32px;color:#ffffff;">
                                        <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#bff0d6;">Welcome to BizTrack</p>
                                        <h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:800;">Verify your email address</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:32px;">
                                        <p style="margin:0 0 18px;font-size:18px;font-weight:700;">Hi {{ $user->name ?? 'there' }},</p>
                                        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#40544b;">
                                            Thanks for creating your BizTrack account. Please verify this email address so we can secure your account before phone verification, business setup, and plan selection.
                                        </p>

                                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                                            <tr>
                                                <td style="border-radius:999px;background:#008f55;">
                                                    <a href="{{ $verificationUrl }}" style="display:inline-block;padding:14px 24px;border-radius:999px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">
                                                        Verify email
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <div style="margin:0 0 22px;padding:16px 18px;border-radius:16px;background:#eef8f2;border:1px solid #d7eee0;">
                                            <p style="margin:0;font-size:14px;line-height:1.6;color:#24483a;">
                                                This verification link expires in <strong>{{ $expiresIn }} minutes</strong>. After your email is verified, BizTrack will continue with phone verification.
                                            </p>
                                        </div>

                                        <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#607269;">
                                            If the button does not work, copy and paste this link into your browser:
                                        </p>
                                        <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.6;">
                                            <a href="{{ $verificationUrl }}" style="color:#006b3f;text-decoration:underline;">{{ $verificationUrl }}</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:22px 20px 0;">
                            <p style="margin:0;font-size:12px;line-height:1.6;color:#71837b;">
                                BizTrack protects your workspace by verifying account email and phone details before onboarding continues.
                            </p>
                            <p style="margin:8px 0 0;font-size:12px;color:#8a9a93;">&copy; {{ date('Y') }} BizTrack. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
