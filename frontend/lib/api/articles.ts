/**
 * Articles API
 *
 * CRUD операції для статей (GraphQL)
 */

import { graphqlRequest } from './client';
import { convertArticleToBlogPost } from './converters';
import {
  GET_ARTICLES,
  GET_ARTICLE_BY_ID,
  GET_BLOG_POSTS,
} from '../graphql/queries';
import {
  CREATE_ARTICLE,
  UPDATE_ARTICLE,
  DELETE_ARTICLE,
} from '../graphql/mutations';
import type {
  GraphQLArticle,
  ArticlesResponse,
  ArticleResponse,
  CreateArticleInput,
  UpdateArticleInput,
} from '../graphql/types';
import type { ApiResponse } from '../api-types';
import type { BlogPost } from '../types';

// Re-export types
export type { GraphQLArticle, CreateArticleInput, UpdateArticleInput };

/**
 * Отримати всі статті
 */
export async function getArticles(): Promise<ApiResponse<GraphQLArticle[]>> {
  try {
    const data = await graphqlRequest<ArticlesResponse>(GET_ARTICLES, {
      pageSize: 100,
    });

    return {
      success: true,
      data: data.articles,
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to fetch articles',
      },
    };
  }
}

/**
 * Отримати статтю за ID
 */
export async function getArticleById(documentId: string): Promise<ApiResponse<GraphQLArticle>> {
  try {
    const data = await graphqlRequest<ArticleResponse>(GET_ARTICLE_BY_ID, {
      documentId,
    });

    if (!data.article) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Article not found',
        },
      };
    }

    return {
      success: true,
      data: data.article,
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to fetch article',
      },
    };
  }
}

/**
 * Створити статтю
 */
export async function createArticle(data: CreateArticleInput): Promise<ApiResponse<GraphQLArticle>> {
  try {
    const result = await graphqlRequest<{ createArticle: GraphQLArticle }>(
      CREATE_ARTICLE,
      { data },
      true
    );

    return {
      success: true,
      data: result.createArticle,
    };
  } catch (error) {
    console.error('Error creating article:', error);
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to create article',
      },
    };
  }
}

/**
 * Оновити статтю
 */
export async function updateArticle(
  documentId: string,
  data: UpdateArticleInput
): Promise<ApiResponse<GraphQLArticle>> {
  try {
    const result = await graphqlRequest<{ updateArticle: GraphQLArticle }>(
      UPDATE_ARTICLE,
      { documentId, data },
      true
    );

    return {
      success: true,
      data: result.updateArticle,
    };
  } catch (error) {
    console.error('Error updating article:', error);
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update article',
      },
    };
  }
}

/**
 * Видалити статтю
 */
export async function deleteArticle(documentId: string): Promise<ApiResponse<void>> {
  try {
    await graphqlRequest(DELETE_ARTICLE, { documentId }, true);

    return { success: true };
  } catch (error) {
    console.error('Error deleting article:', error);
    return {
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to delete article',
      },
    };
  }
}

/**
 * Отримати публічні статті для блогу
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const data = await graphqlRequest<ArticlesResponse>(GET_BLOG_POSTS, {
      pageSize: 20,
    });

    return data.articles.map(convertArticleToBlogPost);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

/**
 * Отримати блог-пост за ID (documentId)
 */
export async function getBlogPostById(documentId: string): Promise<BlogPost | null> {
  try {
    const data = await graphqlRequest<ArticleResponse>(GET_ARTICLE_BY_ID, {
      documentId,
    });

    if (!data.article) {
      return null;
    }

    return convertArticleToBlogPost(data.article);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}
