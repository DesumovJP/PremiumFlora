const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const AUTH_URL = `${STRAPI_URL}/api/auth/admin/login`;

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    email: string;
    username: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Виконати вхід в адмін-панель Strapi
 */
export async function login(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<LoginResponse> {
  // Зберігаємо email якщо встановлено "запам'ятати мене"
  if (rememberMe && typeof window !== "undefined") {
    localStorage.setItem("admin_saved_email", email);
  }
  try {
    const response = await fetch(AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.error?.name || "AUTH_ERROR",
          message: data.error?.message || "Невірний email або пароль",
        },
      };
    }

    // Зберігаємо токен
    if (data.data?.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_token", data.data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.data.user));
        // Зберігаємо налаштування "запам'ятати мене"
        if (rememberMe) {
          localStorage.setItem("admin_remember", "true");
        } else {
          localStorage.removeItem("admin_remember");
          localStorage.removeItem("admin_saved_email");
        }
      }
    }

    return {
      success: true,
      token: data.data?.token,
      user: data.data?.user,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Не вдалося підключитися до сервера",
      },
    };
  }
}

/**
 * Вийти з системи
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  }
}

/**
 * Отримати токен з localStorage
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_token");
  }
  return null;
}

/**
 * Отримати інформацію про користувача
 */
export function getUser(): { id: number; email: string; username: string } | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("admin_user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

/**
 * Перевірити чи користувач авторизований
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Отримати заголовки з токеном для авторизованих запитів
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

