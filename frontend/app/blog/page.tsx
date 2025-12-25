import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { getBlogPosts } from "@/lib/strapi";
import { blogPosts as mockBlogPosts } from "@/lib/mock-data";
import { BlogPageClient } from "./blog-client";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  // Use real posts from Strapi, fallback to mock data if empty
  const displayPosts = posts.length > 0 ? posts : mockBlogPosts;

  return (
    <>
      <Navigation />
      <BlogPageClient posts={displayPosts} />
      <Footer />
    </>
  );
}
