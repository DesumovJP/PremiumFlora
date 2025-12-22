/**
 * Flower lifecycle hooks
 * Ensures slug is always present
 */

// Ukrainian to Latin transliteration map
const translitMap: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd',
  'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i',
  'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ь': '', 'ю': 'yu', 'я': 'ya', ' ': '-',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D',
  'Е': 'E', 'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I',
  'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
  'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
  'Ь': '', 'Ю': 'Yu', 'Я': 'Ya',
};

function generateSlug(name: string): string {
  return name
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default {
  async beforeCreate(event) {
    const { data } = event.params;

    // Якщо slug відсутній, генеруємо його з назви
    if (!data.slug && data.name) {
      data.slug = generateSlug(data.name);
      strapi.log.info(`🏷️ Auto-generated slug for flower: "${data.name}" -> "${data.slug}"`);
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;

    // Якщо slug відсутній, але назва є, генеруємо slug
    if (!data.slug && data.name) {
      data.slug = generateSlug(data.name);
      strapi.log.info(`🏷️ Auto-generated slug for flower: "${data.name}" -> "${data.slug}"`);
    }
  },

  async afterCreate(event) {
    const { result } = event;
    strapi.log.info(`✅ Flower created:`, {
      id: result.id,
      documentId: result.documentId,
      name: result.name,
      slug: result.slug,
    });
  },
};
