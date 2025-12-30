import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFlowerBySlug, getFlowers } from "@/lib/strapi";
import { ProductPageClient } from "./product-client";

const BASE_URL = "https://premium-flora.vercel.app";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

// Generate static params for all products
export async function generateStaticParams() {
  const products = await getFlowers();
  return products.map((product) => ({
    id: product.slug || product.id,
  }));
}

// Generate dynamic metadata for each product
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getFlowerBySlug(id);

  if (!product) {
    return {
      title: "Товар не знайдено",
    };
  }

  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const priceRange =
    minPrice !== maxPrice ? `${minPrice}-${maxPrice}` : `${minPrice}`;

  const title = `${product.name} — купити оптом`;
  const description = `Купити ${product.name} оптом від ${minPrice} грн/шт. Свіжі квіти преміальної якості від Premium Flora. Доставка по Україні, нові поставки щоп'ятниці.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      `${product.name} оптом`,
      `купити ${product.name}`,
      "квіти оптом",
      "свіжі квіти",
    ],
    openGraph: {
      title: `${product.name} | Premium Flora`,
      description,
      type: "website",
      url: `${BASE_URL}/catalog/${product.slug || product.id}`,
      images: product.image
        ? [
            {
              url: product.image,
              width: 800,
              height: 800,
              alt: `${product.name} - Premium Flora`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Premium Flora`,
      description,
      images: product.image ? [product.image] : undefined,
    },
    alternates: {
      canonical: `${BASE_URL}/catalog/${product.slug || product.id}`,
    },
  };
}

// Revalidate every 10 minutes
export const revalidate = 600;

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getFlowerBySlug(id);

  if (!product) {
    notFound();
  }

  // JSON-LD structured data for Product
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: `Свіжі ${product.name} преміальної якості для оптових замовлень`,
    image: product.image || undefined,
    brand: {
      "@type": "Brand",
      name: "Premium Flora",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "UAH",
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: product.variants.length,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Premium Flora",
      },
    },
    category: "Квіти",
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
        name: "Каталог",
        item: `${BASE_URL}/catalog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${BASE_URL}/catalog/${product.slug || product.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductPageClient product={product} />
    </>
  );
}











