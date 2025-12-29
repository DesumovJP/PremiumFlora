"use client";

import { useState } from "react";
import { FullscreenModal } from "@/components/ui/fullscreen-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/types";
import { ArticleModalContent } from "@/components/client/article-modal-content";

// Shared blur placeholder for optimized image loading
const BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

type BlogPageClientProps = {
  posts: BlogPost[];
};

export function BlogPageClient({ posts }: BlogPageClientProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const displayPosts = posts.slice(0, 12);

  return (
    <>
      <main className="pt-16 lg:pt-20">
        {/* Header Section */}
        <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10">
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 -z-10">
            <div className="h-full w-full bg-[url('https://mymediastorage.fra1.digitaloceanspaces.com/premiumFlora/2147760920_14fa35030d.jpg')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/60" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-slate-900 mb-2 sm:mb-3">
                Корисні статті та{' '}
                <span className="relative inline-block">
                  <span className="text-emerald-600">поради</span>
                  <svg className="absolute -bottom-1 left-0 w-full h-2 text-emerald-300/50" viewBox="0 0 200 8" preserveAspectRatio="none">
                    <path d="M0 6c40-3 80-3 120-1.5s80 3 80 0" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
                Дізнайтеся про догляд за квітами, тренди та секрети професійних флористів
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="section-padding-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Each row: 1 large + 2 horizontal; on desktop alternate sides */}
            {Array.from({ length: Math.ceil(displayPosts.length / 3) }, (_, rowIndex) => {
              const start = rowIndex * 3;
              const chunk = displayPosts.slice(start, start + 3);
              if (chunk.length === 0) return null;

              const primary = chunk[0];
              const secondary = chunk.slice(1);
              const isReversed = rowIndex % 2 === 1;

              return (
                <div
                  key={rowIndex}
                  className="mb-8 last:mb-0 grid gap-6 md:grid-cols-2 items-stretch"
                >
                  {/* Primary (large card) */}
                  <div className={isReversed ? "md:order-2" : "md:order-1"}>
                    {primary && (
                      <article className="h-full">
                        <Card
                          className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg cursor-pointer"
                          onClick={() => setSelectedPost(primary)}
                        >
                          <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
                            <Image
                              src={primary.image}
                              alt={primary.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 1024px) 50vw, 50vw"
                              loading="lazy"
                              placeholder="blur"
                              blurDataURL={BLUR_DATA_URL}
                            />
                            <div className="absolute top-3 left-3 z-10">
                              <span className="inline-block rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-md border border-emerald-100/50">
                                {primary.category}
                              </span>
                            </div>
                          </div>

                          <CardContent className="flex flex-1 flex-col p-6 sm:p-7">
                            <h3 className="mb-3 line-clamp-2 text-xl sm:text-2xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-emerald-700">
                              {primary.title}
                            </h3>
                            <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-4">
                              {primary.excerpt}
                            </p>
                            <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(primary.date)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                <span>{primary.author}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </article>
                    )}
                  </div>

                  {/* Secondary (two smaller cards) */}
                  <div
                    className={
                      isReversed
                        ? "grid grid-cols-2 gap-4 md:order-1 md:flex md:flex-col md:gap-6"
                        : "grid grid-cols-2 gap-4 md:order-2 md:flex md:flex-col md:gap-6"
                    }
                  >
                    {secondary.map((post) => (
                      <article key={post.id} className="h-full">
                        <Card
                          className="group flex h-full flex-col lg:flex-row overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg cursor-pointer"
                          onClick={() => setSelectedPost(post)}
                        >
                          <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 lg:w-40 lg:flex-shrink-0 lg:h-full lg:aspect-auto">
                            <Image
                              src={post.image}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 1024px) 25vw, 25vw"
                              loading="lazy"
                              placeholder="blur"
                              blurDataURL={BLUR_DATA_URL}
                            />
                            <div className="absolute top-3 left-3 z-10">
                              <span className="inline-block rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-md border border-emerald-100/50">
                                {post.category}
                              </span>
                            </div>
                          </div>

                          <CardContent className="flex flex-1 flex-col p-5 sm:p-6 lg:p-5 lg:pl-6">
                            <h3 className="mb-3 line-clamp-2 text-lg sm:text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-emerald-700">
                              {post.title}
                            </h3>
                            <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3 hidden sm:block">
                              {post.excerpt}
                            </p>
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
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Fullscreen Modal for Article */}
      {selectedPost && (
        <FullscreenModal
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          breadcrumb={
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap" aria-label="Breadcrumb">
              <Link
                href="/"
                className="inline-flex items-center gap-1 sm:gap-1.5 text-slate-500 dark:text-admin-text-secondary transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline font-medium">Головна</span>
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-admin-text-tertiary flex-shrink-0" />
              <Link
                href="/blog"
                className="text-slate-500 dark:text-admin-text-secondary transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 font-medium flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPost(null);
                }}
              >
                Блог
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-admin-text-tertiary flex-shrink-0" />
              <span className="text-slate-800 dark:text-admin-text-primary font-semibold truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">
                {selectedPost.title}
              </span>
            </nav>
          }
        >
          <ArticleModalContent
            post={selectedPost}
            formatDate={formatDate}
            onBackToBlog={() => setSelectedPost(null)}
          />
        </FullscreenModal>
      )}
    </>
  );
}
