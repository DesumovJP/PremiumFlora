"use client";

import { BlogPost } from "@/lib/types";
import { Calendar, User, ArrowLeft, Sparkles } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Shared blur placeholder for optimized image loading - neutral light grey
const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPjwvc3ZnPg==";

type ArticleModalContentProps = {
  post: BlogPost;
  formatDate: (dateString: string) => string;
  onBackToBlog?: () => void;
};

export function ArticleModalContent({ post, formatDate, onBackToBlog }: ArticleModalContentProps) {
  return (
    <article className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <span className="inline-block rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-md border border-emerald-100/50">
            {post.category}
          </span>
        </div>
        <h1 className="mb-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{post.author}</span>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
      </div>

      {/* Content */}
      <div
        className="max-w-none [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:first:mt-0 [&>p]:mb-4 [&>p]:text-slate-700 [&>p]:leading-relaxed [&>a]:text-emerald-600 [&>a]:no-underline hover:[&>a]:underline"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Back to Blog CTA */}
      {onBackToBlog && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl p-6 sm:p-8 text-center">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-white/80 text-emerald-700 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Ще більше цікавого</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              Бажаєте дізнатися більше?
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              У нашому блозі ви знайдете ще багато корисних порад та натхнення для роботи з квітами
            </p>
            <Button
              onClick={onBackToBlog}
              className="group h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Переглянути всі статті
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}







