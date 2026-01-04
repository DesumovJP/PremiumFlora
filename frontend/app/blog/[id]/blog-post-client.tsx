"use client";

import { BlogPost } from "@/lib/types";
import { Calendar, User, Home, ChevronRight, Sparkles, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPjwvc3ZnPg==";

type BlogPostClientProps = {
  post: BlogPost;
};

export function BlogPostClient({ post }: BlogPostClientProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen pt-16 lg:pt-20">
      {/* Breadcrumb - Neumorphic */}
      <section
        className="border-0 bg-[#fafafa] pt-4 pb-3 sm:pt-6 sm:pb-4"
        style={{
          boxShadow: 'inset 0 -2px 6px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm" aria-label="Breadcrumb">
            <Link
              href="/"
              className="inline-flex items-center gap-1 sm:gap-1.5 text-slate-600 transition-colors hover:text-emerald-600 group"
            >
              <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:scale-110" />
              <span className="font-medium hidden sm:inline">Головна</span>
            </Link>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
            <Link
              href="/blog"
              className="text-slate-600 transition-colors hover:text-emerald-600 font-medium"
            >
              Блог
            </Link>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate max-w-[140px] sm:max-w-[200px] md:max-w-none">
              {post.title}
            </span>
          </nav>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8">
            <div className="mb-4">
              <span className="inline-block rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                {post.category}
              </span>
            </div>
            <h1 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-slate-900">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <figure className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              unoptimized={post.image.includes('digitaloceanspaces.com')}
            />
          </figure>

          {/* Content */}
          <div
            className="prose prose-slate prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-slate-900
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-p:text-slate-700 prose-p:leading-relaxed
              prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900
              prose-ul:text-slate-700 prose-li:marker:text-emerald-500"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Back to Blog CTA - Neumorphic */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div
              className="bg-[#fafafa] rounded-2xl p-6 sm:p-8 text-center"
              style={{
                boxShadow: '4px 4px 12px rgba(0, 0, 0, 0.07), -4px -4px 12px rgba(255, 255, 255, 0.9)',
              }}
            >
              <div
                className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#f5f5f5] text-emerald-700 text-xs sm:text-sm font-medium"
                style={{
                  boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.04), inset -1px -1px 2px rgba(255, 255, 255, 0.7)',
                }}
              >
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Ще більше цікавого</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-1.5 sm:mb-2">
                Бажаєте дізнатися більше?
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 mb-5 sm:mb-6 max-w-md mx-auto">
                У нашому блозі ви знайдете ще багато корисних порад та натхнення для роботи з квітами
              </p>
              <Button
                asChild
                className="group h-9 sm:h-11 md:h-12 px-4 sm:px-6 text-xs sm:text-sm md:text-base bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25"
              >
                <Link href="/blog">
                  <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                  Переглянути всі статті
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
