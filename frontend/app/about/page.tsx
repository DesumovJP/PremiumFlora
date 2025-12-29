import { getFlowers } from "@/lib/strapi";
import { AboutClient } from "./about-client";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const products = await getFlowers({ fresh: true });

  // Extract unique images from products for gallery
  // Filter out null, undefined, and empty strings
  const galleryImages = products
    .map((product) => product.image)
    .filter((image): image is string => !!image && image.trim() !== '')
    .slice(0, 32); // Limit to 32 images for gallery

  return <AboutClient galleryImages={galleryImages} />;
}
