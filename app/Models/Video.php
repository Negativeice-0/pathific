<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;

    // Allow mass assignment for these fields
    protected $fillable = [
        "source",
        "external_id",
        "url",
        "title",
        "is_trending",
        "meta",
    ];

    // If you use JSON columns
    protected $casts = [
        "is_trending" => "boolean",
        "meta" => "array",
    ];
}
