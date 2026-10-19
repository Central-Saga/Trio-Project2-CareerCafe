<?php

namespace App\Providers;

use App\Models\Post;
use App\Models\Session;
use App\Policies\PostPolicy;
use App\Policies\SessionPolicy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Model::preventLazyLoading(! $this->app->isProduction());

        Gate::policy(Post::class, PostPolicy::class);
        Gate::policy(Session::class, SessionPolicy::class);
    }
}
