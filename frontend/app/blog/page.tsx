import type { Metadata } from "next";
import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { getBlogPosts } from "@/lib/strapi";
import { BlogPageClient } from "./blog-client";

// Revalidate every hour
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Блог про квіти та флористику",
  description:
    "Корисні статті про догляд за квітами, тренди флористики та секрети професіоналів. Поради від Premium Flora для флористів та любителів квітів.",
  keywords: [
    "блог про квіти",
    "догляд за квітами",
    "флористика",
    "поради флориста",
    "тренди квітів",
  ],
  openGraph: {
    title: "Блог про квіти та флористику | Premium Flora",
    description:
      "Корисні статті про догляд за квітами, тренди флористики та секрети професіоналів.",
    type: "website",
    url: "https://premium-flora.vercel.app/blog",
  },
  alternates: {
    canonical: "https://premium-flora.vercel.app/blog",
  },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <Navigation />
      <BlogPageClient posts={posts} />
      <Footer />
    </>
  );
}
