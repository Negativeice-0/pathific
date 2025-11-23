<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create("debate_posts", function (Blueprint $table) {
            $table->id();
            $table->foreignId("debate_id")->constrained()->cascadeOnDelete();
            $table->foreignId("user_id")->constrained()->cascadeOnDelete();
            $table->text("content");
            $table
                ->enum("stance", ["pro", "con", "neutral"])
                ->default("neutral");
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("debate_posts");
    }
};
