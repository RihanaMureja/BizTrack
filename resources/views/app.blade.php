<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to apply the saved appearance before React mounts. --}}
        <script>
            (function() {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(0.991 0.006 160);
            }
        </style>

        <link rel="icon" href="/brand/biztrack-icon.jpg" type="image/jpeg">
        <link rel="apple-touch-icon" href="/brand/biztrack-icon.jpg">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'BizTrack') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
