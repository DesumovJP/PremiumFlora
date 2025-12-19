"use client";

import { useState } from "react";
import { BlogPost } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { FullscreenModal } from "@/components/ui/fullscreen-modal";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";

type BlogSectionProps = {
  posts: BlogPost[];
};

export function BlogSection({ posts }: BlogSectionProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const featuredPosts = posts.slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <section className="relative bg-white section-padding-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-12 sm:mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700">
              <BookOpen className="h-4 w-4" />
              <span>Блог</span>
            </div>
            <h2 className="mb-4 text-display-sm font-extrabold tracking-tight text-slate-900">
              Корисні статті та поради
            </h2>
            <p className="mx-auto max-w-2xl text-base sm:text-body-large text-slate-600">
              Дізнайтеся про догляд за квітами, тренди та секрети професійних флористів
            </p>
          </div>

          {/* Blog Posts - Mobile Carousel */}
          <div className="sm:hidden">
            <div className="blog-scroll flex gap-4 overflow-x-auto pb-2 px-2 snap-x snap-mandatory">
              {featuredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="group flex h-full min-w-[82%] flex-col overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg cursor-pointer snap-center rounded-2xl"
                  onClick={() => setSelectedPost(post)}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-block rounded-full bg-emerald-50/95 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-emerald-700 shadow-md">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <CardContent className="flex flex-1 flex-col p-5">
                    {/* Title */}
                    <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-emerald-700">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(post.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Blog Posts - Desktop / Tablet Grid */}
          <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <Card
                key={post.id}
                className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-block rounded-full bg-emerald-50/95 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-emerald-700 shadow-md">
                      {post.category}
                    </span>
                  </div>
                </div>

                <CardContent className="flex flex-1 flex-col p-5 sm:p-6">

                  {/* Title */}
                  <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-emerald-700 sm:text-xl">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold border-2">
              <Link href="/blog">
                Переглянути всі статті
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Fullscreen Modal for Article */}
      {selectedPost && (
        <FullscreenModal
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
        >
          <article className="mx-auto max-w-3xl">
            {/* Header */}
            <div className="mb-8">
              <div className="mb-4">
                <span className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                  {selectedPost.category}
                </span>
              </div>
              <h1 className="mb-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                {selectedPost.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(selectedPost.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{selectedPost.author}</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={selectedPost.image}
                alt={selectedPost.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>

            {/* Content */}
            <div
              className="max-w-none [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:first:mt-0 [&>p]:mb-4 [&>p]:text-slate-700 [&>p]:leading-relaxed [&>a]:text-emerald-600 [&>a]:no-underline hover:[&>a]:underline"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />
          </article>
        </FullscreenModal>
      )}
    </>
  );
}


