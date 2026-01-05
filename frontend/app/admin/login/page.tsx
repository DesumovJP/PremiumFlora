"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertToast } from "@/components/ui/alert-toast";
import { useAlerts } from "@/hooks/use-alerts";
import { login } from "@/lib/auth";
import { Loader2, Lock, Mail, Eye, EyeOff, Flower2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { alerts, showError, dismiss } = useAlerts();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Force light theme on login page
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  // Load saved email if "remember me" was set
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("admin_saved_email");
      const shouldRemember = localStorage.getItem("admin_remember") === "true";
      if (savedEmail && shouldRemember) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showError("Помилка", "Будь ласка, заповніть всі поля");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password, rememberMe);

      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        showError(
          "Помилка входу",
          result.error?.message || "Невірний email або пароль"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("Помилка", "Не вдалося виконати вхід. Спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #e0e5ec 0%, #f0f0f3 25%, #e8f5e9 50%, #f0f0f3 75%, #e0e5ec 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
        }}
      />

      {/* Decorative blurred shapes */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(5, 150, 105, 0.25) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-[20%] left-[10%] w-[200px] h-[200px] rounded-full opacity-20 blur-2xl hidden sm:block"
        style={{ background: "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)" }}
      />

      {/* Neumorphic Card */}
      <div
        className="relative w-full max-w-[360px] sm:max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 backdrop-blur-sm"
        style={{
          background: "linear-gradient(145deg, rgba(250, 250, 250, 0.95), rgba(230, 230, 233, 0.95))",
          boxShadow: "8px 8px 20px rgba(0, 0, 0, 0.1), -8px -8px 20px rgba(255, 255, 255, 0.9)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          {/* Logo Icon */}
          <div
            className="mx-auto mb-4 sm:mb-5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl"
            style={{
              background: "linear-gradient(145deg, #10b981, #059669)",
              boxShadow: "4px 4px 10px rgba(5, 150, 105, 0.3), -2px -2px 8px rgba(16, 185, 129, 0.2)",
            }}
          >
            <Flower2 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">
            Premium Flora
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Вхід в адмін-панель
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-slate-600 pl-1">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full h-10 sm:h-11 pl-10 pr-4 rounded-lg sm:rounded-xl text-sm sm:text-base text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200"
                style={{
                  background: "#f0f0f3",
                  boxShadow: "inset 3px 3px 6px rgba(0, 0, 0, 0.08), inset -3px -3px 6px rgba(255, 255, 255, 0.9)",
                  border: "none",
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-slate-600 pl-1">
              Пароль
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full h-10 sm:h-11 pl-10 pr-10 rounded-lg sm:rounded-xl text-sm sm:text-base text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200"
                style={{
                  background: "#f0f0f3",
                  boxShadow: "inset 3px 3px 6px rgba(0, 0, 0, 0.08), inset -3px -3px 6px rgba(255, 255, 255, 0.9)",
                  border: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2 pl-1">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
            />
            <Label
              htmlFor="remember"
              className="text-xs sm:text-sm font-normal text-slate-500 cursor-pointer"
            >
              Запам&apos;ятати мене
            </Label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(145deg, #10b981, #059669)",
              boxShadow: isLoading
                ? "inset 2px 2px 4px rgba(4, 120, 87, 0.4), inset -1px -1px 3px rgba(16, 185, 129, 0.2)"
                : "4px 4px 12px rgba(5, 150, 105, 0.35), -2px -2px 8px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "5px 5px 16px rgba(5, 150, 105, 0.4), -3px -3px 12px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "4px 4px 12px rgba(5, 150, 105, 0.35), -2px -2px 8px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
              }
            }}
            onMouseDown={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(0) scale(0.98)";
                e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(4, 120, 87, 0.4), inset -1px -1px 3px rgba(16, 185, 129, 0.2)";
              }
            }}
            onMouseUp={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "5px 5px 16px rgba(5, 150, 105, 0.4), -3px -3px 12px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25)";
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Вхід...</span>
              </>
            ) : (
              "Увійти"
            )}
          </button>
        </form>
      </div>

      <AlertToast alerts={alerts} onDismiss={dismiss} />
    </div>
  );
}
