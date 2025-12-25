import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { HeroSectionPremium } from "@/components/client/hero-section-premium";
import { ValueStackingSection } from "@/components/client/value-stacking";
import { FeaturedProducts } from "@/components/client/featured-products";
import { BlogSection } from "@/components/client/blog-section";
import { CtaSection } from "@/components/client/cta-section";
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
        {/* Hero з value proposition */}
        <HeroSectionPremium />

        {/* Чому обирають нас */}
        <ValueStackingSection />

        {/* Каталог товарів */}
        <FeaturedProducts products={products} />

        {/* Блог */}
        <BlogSection posts={displayPosts} />

        {/* CTA */}
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
