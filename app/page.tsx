import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { HeroSectionPremium } from "@/components/client/hero-section-premium";
import { ValueStackingSection } from "@/components/client/value-stacking";
import { FeaturedProducts } from "@/components/client/featured-products";
import { BlogSection } from "@/components/client/blog-section";
import { blogPosts } from "@/lib/mock-data";
import { getFlowers } from "@/lib/strapi";

export default async function Home() {
  const products = await getFlowers();

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
        <BlogSection posts={blogPosts} />
      </main>
      <Footer />
    </>
  );
}
