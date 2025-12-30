import type { Metadata } from "next";
import { getFlowers } from "@/lib/strapi";
import { AboutClient } from "./about-client";

const BASE_URL = "https://premium-flora.vercel.app";

// Revalidate every hour
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Про нас — Premium Flora",
  description:
    "Premium Flora — оптовий постачальник свіжих квітів преміальної якості в Україні. Працюємо з флористами, готелями та івент-агентствами. Офіс у Києві.",
  keywords: [
    "Premium Flora",
    "оптовий постачальник квітів",
    "квіти Київ",
    "оптові квіти Україна",
    "флористика",
  ],
  openGraph: {
    title: "Про нас | Premium Flora",
    description:
      "Premium Flora — оптовий постачальник свіжих квітів преміальної якості в Україні.",
    type: "website",
    url: `${BASE_URL}/about`,
  },
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
};

// LocalBusiness JSON-LD
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Premium Flora",
  description: "Оптовий постачальник свіжих квітів преміальної якості",
  url: BASE_URL,
  telephone: "+380671234567",
  email: "info@premiumflora.ua",
  address: {
    "@type": "PostalAddress",
    streetAddress: "вул. Тираспольська, 41а",
    addressLocality: "Київ",
    addressCountry: "UA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 50.4419,
    longitude: 30.74461,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "16:00",
    },
  ],
  priceRange: "$$",
  image: `${BASE_URL}/logo.png`,
};

export default async function AboutPage() {
  const products = await getFlowers({ fresh: true });

  const galleryImages = products
    .map((product) => product.image)
    .filter((image): image is string => !!image && image.trim() !== '')
    .slice(0, 32);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <AboutClient galleryImages={galleryImages} />
    </>
  );
}
