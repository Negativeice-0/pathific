<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create("debates", function (Blueprint $table) {
            $table->id();
            $table
                ->foreignId("library_id")
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();
            $table->string("topic");
            $table->enum("status", ["open", "closed"])->default("open");
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("debates");
    }
};
