import { getFlowers } from "@/lib/strapi";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  // Використовуємо свіжі дані без кешування для адмін-панелі
  const products = await getFlowers({ fresh: true });

  return <AdminClient products={products} />;
}
