import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { HeroSection } from "@/components/client/hero-section";
import { FeaturedProducts } from "@/components/client/featured-products";
import { BenefitsSection } from "@/components/client/benefits-section";
import { StatsSection } from "@/components/client/stats-section";
import { BlogSection } from "@/components/client/blog-section";
import { products, blogPosts } from "@/lib/mock-data";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturedProducts products={products} />
        <BenefitsSection />
        <BlogSection posts={blogPosts} />
      </main>
      <Footer />
    </>
  );
}
