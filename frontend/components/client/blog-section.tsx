"use client";

import { useState, useRef } from "react";
import { BlogPost } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { FullscreenModal } from "@/components/ui/fullscreen-modal";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArticleModalContent } from "./article-modal-content";

// Shared blur placeholder for optimized image loading - neutral light grey
const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPjwvc3ZnPg==";

type BlogSectionProps = {
  posts: BlogPost[];
};

export function BlogSection({ posts }: BlogSectionProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const featuredPosts = posts.slice(0, 3);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  return (
    <>
      <section ref={ref} className="relative overflow-hidden pt-10 lg:pt-14 pb-10 lg:pb-14 bg-[#f8fbf9]">

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-700 mb-3 sm:mb-4">
              Корисні статті та{' '}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                поради
              </span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-500 max-w-2xl mx-auto">
              Дізнайтеся про догляд за квітами, тренди та секрети професійних флористів
            </p>
          </motion.div>

          {/* Blog Posts - Horizontal scroll on mobile, grid on desktop */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative -mx-4 sm:mx-0"
          >
            {/* Mobile: Horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto pb-4 px-4 sm:hidden snap-x snap-mandatory scroll-pl-4 scrollbar-hide">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={cardVariants}
                  className="flex-shrink-0 w-[280px] snap-start"
                >
                  <Card
                    className="group h-full flex flex-col overflow-hidden border-0 bg-[#fafafa] cursor-pointer rounded-xl active:scale-[0.98] transition-all duration-150"
                    style={{
                      boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.06), -3px -3px 8px rgba(255, 255, 255, 0.8)',
                    }}
                    onClick={() => setSelectedPost(post)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="280px"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        unoptimized={post.image.includes('digitaloceanspaces.com')}
                      />
                      {/* Category Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <span className="inline-block rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <CardContent className="flex flex-1 flex-col p-3">
                      {/* Title */}
                      <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-tight text-slate-700">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="mb-3 flex-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(post.date)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Desktop: Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={cardVariants}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Card
                    className="group h-full flex flex-col overflow-hidden border-0 bg-[#fafafa] cursor-pointer rounded-2xl transition-all duration-200"
                    style={{
                      boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.06), -3px -3px 8px rgba(255, 255, 255, 0.8)',
                    }}
                    onClick={() => setSelectedPost(post)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        unoptimized={post.image.includes('digitaloceanspaces.com')}
                      />
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-block rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
                      {/* Title */}
                      <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-tight text-slate-700 group-hover:text-emerald-700 transition-colors sm:text-xl">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
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
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 lg:mt-16 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden bg-white hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-200 text-slate-700 hover:text-amber-700 shadow-sm hover:shadow-md h-10 sm:h-12 px-5 sm:px-8 text-sm sm:text-base font-semibold transition-all duration-300"
              >
                <Link href="/blog" className="flex items-center gap-2">
                  <span className="relative z-10">Переглянути всі статті</span>
                  <motion.span
                    className="relative z-10"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Fullscreen Modal for Article */}
      {selectedPost && (
        <FullscreenModal
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          breadcrumb={
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap" aria-label="Breadcrumb">
              <Link
                href="/"
                className="inline-flex items-center gap-1 sm:gap-1.5 text-slate-500 transition-colors hover:text-emerald-600 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline font-medium">Головна</span>
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
              <Link
                href="/blog"
                className="text-slate-500 transition-colors hover:text-emerald-600 font-medium flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPost(null);
                }}
              >
                Блог
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
              <span className="text-slate-700 font-semibold truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">
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
