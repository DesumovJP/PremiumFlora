import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { HomePageClient } from "@/components/client/home-page-client";
import { blogPosts } from "@/lib/mock-data";
import { getFlowers, getBlogPosts } from "@/lib/strapi";

export default async function Home() {
  const [products, posts] = await Promise.all([
    getFlowers(),
    getBlogPosts(),
  ]);

  // Use real posts from Strapi, fallback to mock data if empty
  const displayPosts = posts.length > 0 ? posts : blogPosts;

  return (
    <>
      <Navigation />
      <main>
        <HomePageClient products={products} posts={displayPosts} />
      </main>
      <Footer />
    </>
  );
}
