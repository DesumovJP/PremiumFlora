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

// ============================================
// Article Mutations
// ============================================

/**
 * Створити статтю
 */
export const CREATE_ARTICLE = gql`
  mutation CreateArticle($data: ArticleInput!) {
    createArticle(data: $data) {
      documentId
      title
      slug
      content
      category
      priority
      pinned
      createdAt
      updatedAt
    }
  }
`;

/**
 * Оновити статтю
 */
export const UPDATE_ARTICLE = gql`
  mutation UpdateArticle($documentId: ID!, $data: ArticleInput!) {
    updateArticle(documentId: $documentId, data: $data) {
      documentId
      title
      slug
      content
      category
      priority
      pinned
      createdAt
      updatedAt
    }
  }
`;

/**
 * Видалити статтю
 */
export const DELETE_ARTICLE = gql`
  mutation DeleteArticle($documentId: ID!) {
    deleteArticle(documentId: $documentId) {
      documentId
    }
  }
`;

// ============================================
// Task Mutations
// ============================================

/**
 * Створити завдання
 */
export const CREATE_TASK = gql`
  mutation CreateTask($data: TaskInput!) {
    createTask(data: $data) {
      documentId
      title
      description
      dueDate
      reminderAt
      priority
      status
      category
      completedAt
      notes
      createdAt
      updatedAt
    }
  }
`;

/**
 * Оновити завдання
 */
export const UPDATE_TASK = gql`
  mutation UpdateTask($documentId: ID!, $data: TaskInput!) {
    updateTask(documentId: $documentId, data: $data) {
      documentId
      title
      description
      dueDate
      reminderAt
      priority
      status
      category
      completedAt
      notes
      createdAt
      updatedAt
    }
  }
`;

/**
 * Видалити завдання
 */
export const DELETE_TASK = gql`
  mutation DeleteTask($documentId: ID!) {
    deleteTask(documentId: $documentId) {
      documentId
    }
  }
`;
