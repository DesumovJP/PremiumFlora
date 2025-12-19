import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { getFlowers } from "@/lib/strapi";
import { CatalogClient } from "./catalog-client";

export default async function CatalogPage() {
  const products = await getFlowers();

  return (
    <>
      <Navigation />
      <CatalogClient products={products} />
      <Footer />
    </>
  );
}
