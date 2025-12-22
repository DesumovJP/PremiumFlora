/**
 * Supply Lifecycle Hooks
 *
 * Ці хуки допомагають відслідковувати процес створення Supply записів
 * та діагностувати проблеми з збереженням даних.
 */

export default {
  /**
   * Викликається перед створенням Supply запису
   */
  async beforeCreate(event) {
    const { data } = event.params;

    strapi.log.info('Supply beforeCreate hook triggered', {
      filename: data.filename,
      checksum: data.checksum,
      hasRows: !!data.rows,
      rowsType: typeof data.rows,
      rowsIsArray: Array.isArray(data.rows),
      rowsCount: Array.isArray(data.rows) ? data.rows.length : 0,
      supplyStatus: data.supplyStatus,
      hasErrors: !!data.supplyErrors,
      hasWarnings: !!data.supplyWarnings,
    });
  },

  /**
   * Викликається після створення Supply запису
   */
  async afterCreate(event) {
    const { result } = event;

    strapi.log.info('Supply afterCreate hook triggered', {
      id: result.id,
      documentId: result.documentId,
      filename: result.filename,
      supplyStatus: result.supplyStatus,
      publishedAt: result.publishedAt,
      rowsStored: result.rows
        ? (Array.isArray(result.rows) ? result.rows.length : 'not an array')
        : 'null or undefined',
      rowsType: result.rows ? typeof result.rows : 'null',
    });
  },

  /**
   * Викликається перед оновленням Supply запису
   */
  async beforeUpdate(event) {
    const { data } = event.params;

    strapi.log.info('Supply beforeUpdate hook triggered', {
      hasRows: !!data.rows,
      rowsType: data.rows ? typeof data.rows : 'null',
      rowsIsArray: data.rows ? Array.isArray(data.rows) : false,
    });
  },

  /**
   * Викликається після оновлення Supply запису
   */
  async afterUpdate(event) {
    const { result } = event;

    strapi.log.info('Supply afterUpdate hook triggered', {
      id: result.id,
      documentId: result.documentId,
      filename: result.filename,
      rowsStored: result.rows
        ? (Array.isArray(result.rows) ? result.rows.length : 'not an array')
        : 'null or undefined',
    });
  },
};
