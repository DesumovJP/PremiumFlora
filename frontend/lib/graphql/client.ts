import { GraphQLClient } from "graphql-request";

const STRAPI_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337"
).replace(/\/$/, "");

export const GRAPHQL_URL = `${STRAPI_URL}/graphql`;
export { STRAPI_URL };

/**
 * Створює GraphQL клієнт з опціональною авторизацією
 */
export function createGraphQLClient(token?: string): GraphQLClient {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return new GraphQLClient(GRAPHQL_URL, { headers });
}

/**
 * GraphQL клієнт для публічних запитів (без авторизації)
 */
export const publicClient = createGraphQLClient();

/**
 * Отримує токен з localStorage (тільки на клієнті)
 */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * GraphQL клієнт з авторизацією (для захищених запитів)
 */
export function getAuthClient(): GraphQLClient {
  const token = getStoredToken();
  const apiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  return createGraphQLClient(token || apiToken || undefined);
}

/**
 * Виконує GraphQL запит з автоматичною авторизацією
 */
export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  requireAuth: boolean = false
): Promise<T> {
  const client = requireAuth ? getAuthClient() : publicClient;
  return client.request<T>(query, variables);
}
