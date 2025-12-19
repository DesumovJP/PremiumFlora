import { notFound } from "next/navigation";
import { getFlowerBySlug } from "@/lib/strapi";
import { ProductPageClient } from "./product-client";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  // id може бути slug або documentId
  const product = await getFlowerBySlug(id);

  if (!product) {
    notFound();
  }

  return <ProductPageClient product={product} />;
}



