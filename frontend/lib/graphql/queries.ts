import { gql } from "graphql-request";

/**
 * GraphQL Queries для Strapi v5
 *
 * ВАЖЛИВО:
 * - Використовуємо documentId замість id
 * - НЕ використовуємо обгортку "data" у відповідях
 * - Для фільтрації використовуємо slug або documentId
 */

// ============================================
// Фрагменти для повторного використання
// ============================================

export const IMAGE_FRAGMENT = gql`
  fragment ImageFields on UploadFile {
    documentId
    name
    alternativeText
    url
    width
    height
    formats
  }
`;

export const VARIANT_FRAGMENT = gql`
  fragment VariantFields on Variant {
    documentId
    length
    price
    stock
  }
`;

export const FLOWER_FRAGMENT = gql`
  fragment FlowerFields on Flower {
    documentId
    name
    slug
    description
    publishedAt
    updatedAt
    image {
      ...ImageFields
    }
    variants {
      ...VariantFields
    }
  }
  ${IMAGE_FRAGMENT}
  ${VARIANT_FRAGMENT}
`;

export const CUSTOMER_FRAGMENT = gql`
  fragment CustomerFields on Customer {
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
`;

// ============================================
// Flowers Queries
// ============================================

/**
 * Отримати всі опубліковані квіти
 */
export const GET_FLOWERS = gql`
  query GetFlowers($pageSize: Int = 500) {
    flowers(
      pagination: { pageSize: $pageSize }
      filters: { publishedAt: { notNull: true } }
    ) {
      ...FlowerFields
    }
  }
  ${FLOWER_FRAGMENT}
`;

/**
 * Отримати квітку за slug
 */
export const GET_FLOWER_BY_SLUG = gql`
  query GetFlowerBySlug($slug: String!) {
    flowers(
      filters: { slug: { eq: $slug }, publishedAt: { notNull: true } }
    ) {
      ...FlowerFields
    }
  }
  ${FLOWER_FRAGMENT}
`;

/**
 * Отримати квітку за documentId (для редагування)
 */
export const GET_FLOWER_BY_DOCUMENT_ID = gql`
  query GetFlowerByDocumentId($documentId: ID!) {
    flower(documentId: $documentId) {
      ...FlowerFields
    }
  }
  ${FLOWER_FRAGMENT}
`;

/**
 * Пошук квітів за назвою
 */
export const SEARCH_FLOWERS = gql`
  query SearchFlowers($query: String!, $pageSize: Int = 100) {
    flowers(
      filters: { name: { containsi: $query } }
      pagination: { pageSize: $pageSize }
    ) {
      ...FlowerFields
    }
  }
  ${FLOWER_FRAGMENT}
`;

// ============================================
// Customers Queries
// ============================================

/**
 * Отримати всіх клієнтів
 */
export const GET_CUSTOMERS = gql`
  query GetCustomers($pageSize: Int = 100) {
    customers(
      pagination: { pageSize: $pageSize }
      sort: ["name:asc"]
    ) {
      ...CustomerFields
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

/**
 * Отримати клієнта за documentId
 */
export const GET_CUSTOMER_BY_ID = gql`
  query GetCustomerById($documentId: ID!) {
    customer(documentId: $documentId) {
      ...CustomerFields
      transactions {
        documentId
        date
        type
        amount
        paymentStatus
      }
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

// ============================================
// Transactions Queries
// ============================================

/**
 * Отримати транзакції з фільтрами
 */
export const GET_TRANSACTIONS = gql`
  query GetTransactions(
    $pageSize: Int = 100
    $type: String
    $paymentStatus: String
    $customerId: ID
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    transactions(
      pagination: { pageSize: $pageSize }
      sort: ["date:desc"]
      filters: {
        type: { eq: $type }
        paymentStatus: { eq: $paymentStatus }
        customer: { documentId: { eq: $customerId } }
        date: { gte: $dateFrom, lte: $dateTo }
      }
    ) {
      documentId
      date
      type
      operationId
      paymentStatus
      amount
      items
      paymentDate
      notes
      writeOffReason
      createdAt
      updatedAt
      customer {
        documentId
        name
        type
      }
    }
  }
`;

// ============================================
// Variants Queries
// ============================================

/**
 * Отримати варіант за documentId (для оновлення)
 */
export const GET_VARIANT_BY_ID = gql`
  query GetVariantById($documentId: ID!) {
    variant(documentId: $documentId) {
      documentId
      length
      price
      stock
      flower {
        documentId
        name
        slug
      }
    }
  }
`;
