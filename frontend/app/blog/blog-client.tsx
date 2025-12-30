"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/types";

const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPjwvc3ZnPg==";

type BlogPageClientProps = {
  posts: BlogPost[];
};

export function BlogPageClient({ posts }: BlogPageClientProps) {
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
        {/* Header Section - Clean Minimal Design */}
        <section className="border-b border-slate-100 bg-slate-50/50 py-4 sm:py-5 lg:py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Корисні статті та <span className="text-emerald-600">поради</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-lg">
              Догляд за квітами, тренди та секрети професійних флористів
            </p>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="section-padding-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {displayPosts.length === 0 ? (
              /* Empty state */
              <div className="py-16 sm:py-24 text-center">
                <div className="mx-auto max-w-md">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">
                    Статті скоро з'являться
                  </h3>
                  <p className="text-sm text-slate-600">
                    Ми працюємо над корисними матеріалами для вас. Слідкуйте за оновленнями!
                  </p>
                </div>
              </div>
            ) : (
            /* Each row: 1 large + 2 horizontal; on desktop alternate sides */
            Array.from({ length: Math.ceil(displayPosts.length / 3) }, (_, rowIndex) => {
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
                        <Link href={`/blog/${primary.id}`} className="block h-full">
                        <Card
                          className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg cursor-pointer"
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
                              unoptimized={primary.image.includes('digitaloceanspaces.com')}
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
                        </Link>
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
                        <Link href={`/blog/${post.id}`} className="block h-full">
                        <Card
                          className="group flex h-full flex-col lg:flex-row overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg cursor-pointer"
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
                              unoptimized={post.image.includes('digitaloceanspaces.com')}
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
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })
            )}
          </div>
        </section>
      </main>
    </>
  );
}
