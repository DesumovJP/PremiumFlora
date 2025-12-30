import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { getBlogPostById, getBlogPosts } from "@/lib/strapi";
import { BlogPostClient } from "./blog-post-client";

const BASE_URL = "https://premium-flora.vercel.app";

type BlogPostPageProps = {
  params: Promise<{ id: string }>;
};

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

// Generate dynamic metadata for each blog post
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) {
    return {
      title: "Стаття не знайдена",
    };
  }

  const description = post.excerpt.length > 160
    ? post.excerpt.slice(0, 157) + "..."
    : post.excerpt;

  return {
    title: post.title,
    description,
    keywords: [
      post.category,
      "блог про квіти",
      "флористика",
      "догляд за квітами",
    ],
    authors: [{ name: post.author }],
    openGraph: {
      title: `${post.title} | Premium Flora`,
      description,
      type: "article",
      url: `${BASE_URL}/blog/${post.id}`,
      publishedTime: post.date,
      authors: [post.author],
      images: post.image
        ? [
            {
              url: post.image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.image ? [post.image] : undefined,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${post.id}`,
    },
  };
}

// Revalidate every hour
export const revalidate = 3600;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) {
    notFound();
  }

  // JSON-LD structured data for Article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image || undefined,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Premium Flora",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${post.id}`,
    },
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Головна",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Блог",
        item: `${BASE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${BASE_URL}/blog/${post.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navigation />
      <BlogPostClient post={post} />
      <Footer />
    </>
  );
}
