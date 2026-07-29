<?php

namespace App\Helpers;

class ReportHelper
{
    public static function slug(string $type): string
    {
        return str($type)->lower()->replace('_', '-')->slug()->toString();
    }

    public static function title(string $type): string
    {
        return str($type)->replace('_', ' ')->title()->toString().' Report';
    }
}
