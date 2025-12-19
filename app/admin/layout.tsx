"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Перевіряємо авторизацію тільки на клієнті
    if (typeof window !== "undefined") {
      const authenticated = isAuthenticated();
      
      // Якщо на сторінці логіну, не перевіряємо авторизацію
      if (pathname === "/admin/login") {
        setIsChecking(false);
        // Якщо авторизований і на сторінці логіну, перенаправляємо на адмінку
        if (authenticated) {
          router.push("/admin");
        }
        return;
      }
      
      // Якщо не авторизований і не на сторінці логіну, перенаправляємо
      if (!authenticated) {
        router.push("/admin/login");
        return;
      }
      
      setIsChecking(false);
    }
  }, [pathname, router]);

  // Показуємо завантаження під час перевірки
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return <>{children}</>;
}

