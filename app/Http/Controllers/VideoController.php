<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Models\Video;

class VideoController extends Controller
{
    /**
     * Display a listing of trending videos.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $videos = Video::query()->where("is_trending", true)->get();

        return response()->json([
            "success" => true,
            "data" => $videos,
        ]);
    }
}
