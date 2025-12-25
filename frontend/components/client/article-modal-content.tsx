"use client";

import { BlogPost } from "@/lib/types";
import { Calendar, User } from "lucide-react";
import Image from "next/image";

type ArticleModalContentProps = {
  post: BlogPost;
  formatDate: (dateString: string) => string;
};

export function ArticleModalContent({ post, formatDate }: ArticleModalContentProps) {
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
        />
      </div>

      {/* Content */}
      <div
        className="max-w-none [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:first:mt-0 [&>p]:mb-4 [&>p]:text-slate-700 [&>p]:leading-relaxed [&>a]:text-emerald-600 [&>a]:no-underline hover:[&>a]:underline"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}







