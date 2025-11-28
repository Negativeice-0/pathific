<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Video;

class VideosTableSeeder extends Seeder
{
    public function run(): void
    {
        Video::create([
            "source" => "youtube",
            "external_id" => "abc123",
            "url" => "https://youtube.com/watch?v=abc123",
            "title" => "Intro to Pathific",
            "is_trending" => true,
            "meta" => ["duration" => "3:45", "tags" => ["curation", "demo"]],
        ]);
    }
}
