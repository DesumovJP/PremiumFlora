import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { HomePageClient } from "@/components/client/home-page-client";
import { blogPosts } from "@/lib/mock-data";
import { getFlowers, getBlogPosts } from "@/lib/strapi";

const BASE_URL = "https://premium-flora.vercel.app";

// Organization JSON-LD for homepage
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Premium Flora",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: "Преміальні оптові поставки свіжих квітів для флористів, готелів та івент-агентств в Україні",
  address: {
    "@type": "PostalAddress",
    streetAddress: "вул. Тираспольська, 41а",
    addressLocality: "Київ",
    addressCountry: "UA",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+380671234567",
    contactType: "sales",
    availableLanguage: ["Ukrainian"],
  },
  sameAs: [
    "https://t.me/premiumflora",
  ],
};

// WebSite JSON-LD for search
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Premium Flora",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/catalog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function Home() {
  const [products, posts] = await Promise.all([
    getFlowers(),
    getBlogPosts(),
  ]);

  const displayPosts = posts.length > 0 ? posts : blogPosts;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Navigation />
      <main className="overscroll-none">
        <HomePageClient products={products} posts={displayPosts} />
      </main>
      <Footer />
    </>
  );
}
