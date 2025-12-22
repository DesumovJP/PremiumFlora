import { gql } from "graphql-request";

/**
 * GraphQL Mutations для Strapi v5
 *
 * ВАЖЛИВО:
 * - Використовуємо documentId для ідентифікації записів
 * - Дані передаємо через "data" об'єкт у мутаціях
 */

// ============================================
// Flower Mutations
// ============================================

/**
 * Оновити квітку
 */
export const UPDATE_FLOWER = gql`
  mutation UpdateFlower($documentId: ID!, $data: FlowerInput!) {
    updateFlower(documentId: $documentId, data: $data) {
      documentId
      name
      slug
      description
      image {
        documentId
        url
      }
    }
  }
`;

// ============================================
// Variant Mutations
// ============================================

/**
 * Оновити варіант
 */
export const UPDATE_VARIANT = gql`
  mutation UpdateVariant($documentId: ID!, $data: VariantInput!) {
    updateVariant(documentId: $documentId, data: $data) {
      documentId
      length
      price
      stock
    }
  }
`;

// ============================================
// Customer Mutations
// ============================================

/**
 * Створити клієнта
 */
export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($data: CustomerInput!) {
    createCustomer(data: $data) {
      documentId
      name
      type
      phone
      email
      address
      totalSpent
      orderCount
      createdAt
      updatedAt
    }
  }
`;

/**
 * Оновити клієнта
 */
export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($documentId: ID!, $data: CustomerInput!) {
    updateCustomer(documentId: $documentId, data: $data) {
      documentId
      name
      type
      phone
      email
      address
    }
  }
`;

/**
 * Видалити клієнта
 */
export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($documentId: ID!) {
    deleteCustomer(documentId: $documentId) {
      documentId
    }
  }
`;
