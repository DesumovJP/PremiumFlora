"use client";

import { useState } from "react";
import { BlogPost } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { FullscreenModal } from "@/components/ui/fullscreen-modal";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { WaveDivider, DecorativeLine } from "@/components/ui/decorations";
import { ArticleModalContent } from "./article-modal-content";

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
      <section className="relative overflow-hidden section-padding-sm">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-amber-50/20 to-emerald-50/30" />

        {/* Decorative gradient orbs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-radial from-amber-100/40 via-amber-50/20 to-transparent rounded-full blur-3xl translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-radial from-emerald-100/30 via-emerald-50/10 to-transparent rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        {/* Subtle noise texture */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* Wave divider at top (flipped) */}
        <WaveDivider position="top" variant="curved" color="white" flip />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-6 sm:mb-10 lg:mb-12 text-center">
            <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-amber-700 border border-amber-100/50 shadow-sm">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Блог</span>
            </div>
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              Корисні статті та <span className="text-emerald-600">поради</span>
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg text-slate-600 px-4">
              Дізнайтеся про догляд за квітами, тренди та секрети професійних флористів
            </p>
          </div>

          {/* Decorative line */}
          <div className="mb-6 sm:mb-10 hidden sm:block">
            <DecorativeLine variant="gradient" />
          </div>

          {/* Blog Posts - Mobile Carousel */}
          <div className="sm:hidden">
            <div className="blog-scroll flex gap-4 overflow-x-auto pb-2 px-2 snap-x snap-mandatory">
              {featuredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="group flex h-full min-w-[82%] flex-col overflow-hidden border border-slate-200/80 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg cursor-pointer snap-center rounded-2xl"
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
                      <span className="inline-block rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-emerald-700 shadow-md border border-emerald-100/50">
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
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {featuredPosts.map((post, index) => (
              <div key={post.id} className="group pb-2">
              <Card
                className="flex h-full flex-col overflow-hidden border border-slate-200/80 bg-white/90 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:border-emerald-300 group-hover:shadow-xl cursor-pointer rounded-2xl"
                onClick={() => setSelectedPost(post)}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 will-change-transform group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-block rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-md border border-emerald-100/50">
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
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-8 sm:mt-12 text-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="group h-11 sm:h-12 px-5 sm:px-8 text-sm sm:text-base font-semibold border-2 border-slate-200 bg-white/80 backdrop-blur-sm hover:border-amber-300 hover:bg-amber-50/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Link href="/blog" className="flex items-center gap-2">
                Переглянути всі статті
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
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
          breadcrumb={
            <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-slate-600 dark:text-admin-text-secondary transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 group"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Home className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                <span className="font-medium">Головна</span>
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-400 dark:text-admin-text-tertiary flex-shrink-0" />
              <Link
                href="/blog"
                className="text-slate-600 dark:text-admin-text-secondary transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPost(null);
                }}
              >
                Блог
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-400 dark:text-admin-text-tertiary flex-shrink-0" />
              <span className="text-slate-900 dark:text-admin-text-primary font-semibold truncate">
                {selectedPost.title}
              </span>
            </nav>
          }
        >
          <ArticleModalContent post={selectedPost} formatDate={formatDate} />
        </FullscreenModal>
      )}
    </>
  );
}
