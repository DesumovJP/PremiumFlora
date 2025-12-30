import type { Metadata } from "next";
import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { getFlowers } from "@/lib/strapi";
import { CatalogClient } from "./catalog-client";

// Revalidate every 5 minutes for fresh data
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Каталог квітів оптом",
  description:
    "Каталог свіжих квітів оптом від Premium Flora. Троянди, тюльпани, хризантеми та інші квіти преміальної якості. Доставка по Україні, нові поставки щоп'ятниці.",
  keywords: [
    "каталог квітів",
    "квіти оптом",
    "купити квіти оптом",
    "троянди оптом",
    "тюльпани оптом",
    "свіжі квіти Київ",
  ],
  openGraph: {
    title: "Каталог квітів оптом | Premium Flora",
    description:
      "Каталог свіжих квітів оптом. Троянди, тюльпани, хризантеми преміальної якості. Доставка по Україні.",
    type: "website",
    url: "https://premium-flora.vercel.app/catalog",
  },
  alternates: {
    canonical: "https://premium-flora.vercel.app/catalog",
  },
};

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
