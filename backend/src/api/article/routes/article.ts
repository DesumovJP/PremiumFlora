import { factories } from '@strapi/strapi';

// @ts-expect-error - type will be generated after first run
export default factories.createCoreRouter('api::article.article');
