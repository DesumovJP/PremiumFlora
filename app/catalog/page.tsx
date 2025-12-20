import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { getFlowers } from "@/lib/strapi";
import { CatalogClient } from "./catalog-client";

// Вимикаємо кешування для уникнення hydration mismatch
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const products = await getFlowers({ fresh: true });

  return (
    <>
      <Navigation />
      <CatalogClient products={products} />
      <Footer />
    </>
  );
}
