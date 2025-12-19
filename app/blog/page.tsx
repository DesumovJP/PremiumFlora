"use client";

import { useState } from "react";
import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { FullscreenModal } from "@/components/ui/fullscreen-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, BookOpen } from "lucide-react";
import { blogPosts } from "@/lib/mock-data";
import { BlogPost } from "@/lib/types";
import Image from "next/image";

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

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
      <Navigation />
      <main>
        {/* Header Section */}
        <section className="relative overflow-hidden section-padding-sm">
          {/* Background image with soft overlay */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="h-full w-full bg-[url('/blog.jpg')] bg-cover bg-center" />
            {/* Основний білий оверлей з легким blur */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-md" />
            {/* Нижній градієнт для м'якого переходу до секції статей */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                <BookOpen className="h-4 w-4" />
                <span>Блог</span>
              </div>
              <h1 className="mb-4 text-display-sm font-extrabold tracking-tight text-slate-900">
                Корисні статті та поради
              </h1>
              <p className="text-body-large text-slate-600">
                Дізнайтеся про догляд за квітами, тренди та секрети професійних флористів
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="section-padding-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {(() => {
              const posts = blogPosts.slice(0, 12);

              return (
                <>
                  {/* У кожному ряді: 1 велика + 2 горизонтальні; на десктопі чергуємо сторони, на мобільному всі йдуть послідовно */}
                  {Array.from({ length: Math.ceil(posts.length / 3) }, (_, rowIndex) => {
                      const start = rowIndex * 3;
                      const chunk = posts.slice(start, start + 3);
                      if (chunk.length === 0) return null;

                      const primary = chunk[0];
                      const secondary = chunk.slice(1);
                      const isReversed = rowIndex % 2 === 1;

                      return (
                        <div
                          key={rowIndex}
                          className="mb-8 last:mb-0 grid gap-6 md:grid-cols-2 items-stretch"
                        >
                          {/* Primary (велика картка): завжди першою на мобільному, чергується по сторонах з md */}
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
                                    />
                                    <div className="absolute top-2 left-2 z-10">
                                      <span className="inline-block rounded-full bg-emerald-50/95 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-emerald-700 shadow-md">
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

                          {/* Secondary (дві менші): на мобільному під великою у дві колонки, з md чергується сторона */}
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
                                    />
                                    <div className="absolute top-2 left-2 z-10">
                                      <span className="inline-block rounded-full bg-emerald-50/95 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-emerald-700 shadow-md">
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
                </>
              );
            })()}
          </div>
        </section>
      </main>
      <Footer />

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
              className="max-w-none prose prose-lg prose-slate 
                [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:first:mt-0 
                [&>h3]:mb-3 [&>h3]:mt-6 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-slate-800
                [&>p]:mb-4 [&>p]:text-slate-700 [&>p]:leading-relaxed 
                [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2
                [&>ol]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2
                [&>li]:text-slate-700 [&>li]:leading-relaxed
                [&>img]:rounded-xl [&>img]:my-6 [&>img]:shadow-lg
                [&>a]:text-emerald-600 [&>a]:no-underline hover:[&>a]:underline
                [&>strong]:font-semibold [&>strong]:text-slate-900"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />
          </article>
        </FullscreenModal>
      )}
    </>
  );
}

