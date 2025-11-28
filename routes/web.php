<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoController; // <-- add this line

Route::get("/", function () {
    return view("welcome");
});

Route::get("/videos", [VideoController::class, "index"]);
