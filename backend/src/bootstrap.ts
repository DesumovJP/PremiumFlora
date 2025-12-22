import type { Core } from "@strapi/strapi";
import { cleanupDuplicates } from "./scripts/cleanup-duplicates";
import { resetFlowersAndVariants } from "./scripts/reset-flowers";

const flowersData = [
  {
    name: "Троянда червона",
    slug: "troianda-chervona",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Класична червона троянда - символ кохання та пристрасті. Ідеально підходить для романтичних букетів та особливих моментів." }],
      },
    ],
    variants: [
      { length: 50, price: 62, stock: 520 },
      { length: 60, price: 75, stock: 450 },
      { length: 70, price: 90, stock: 320 },
      { length: 80, price: 105, stock: 180 },
      { length: 90, price: 130, stock: 120 },
    ],
  },
  {
    name: "Троянда біла",
    slug: "troianda-bila",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Елегантна біла троянда символізує чистоту та невинність. Чудовий вибір для весільних букетів." }],
      },
    ],
    variants: [
      { length: 60, price: 75, stock: 380 },
      { length: 70, price: 90, stock: 290 },
      { length: 80, price: 105, stock: 210 },
    ],
  },
  {
    name: "Хризантема",
    slug: "khryzantema",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Яскрава та довговічна хризантема. Чудово зберігається у вазі та радує своєю красою тривалий час." }],
      },
    ],
    variants: [
      { length: 60, price: 54, stock: 520 },
      { length: 70, price: 66, stock: 380 },
    ],
  },
  {
    name: "Лілія біла",
    slug: "liliia-bila",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Величні білі лілії з неперевершеним ароматом. Ідеально підходять для урочистих подій." }],
      },
    ],
    variants: [
      { length: 70, price: 120, stock: 240 },
      { length: 80, price: 135, stock: 190 },
    ],
  },
  {
    name: "Гвоздика рожева",
    slug: "hvozdyka-rozheva",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Ніжна рожева гвоздика з тонким ароматом. Універсальна квітка для будь-якого букету." }],
      },
    ],
    variants: [
      { length: 60, price: 45, stock: 610 },
      { length: 70, price: 54, stock: 480 },
      { length: 80, price: 72, stock: 320 },
    ],
  },
  {
    name: "Тюльпан червоний",
    slug: "tiulpan-chervonyi",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Весняний символ красі та радості. Яскравий червоний тюльпан додає букету свіжості та елегантності." }],
      },
    ],
    variants: [
      { length: 60, price: 60, stock: 390 },
      { length: 70, price: 72, stock: 280 },
    ],
  },
  {
    name: "Гортензія блакитна",
    slug: "hortenziia-blakytna",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Неймовірна блакитна гортензія з пишними суцвіттями. Створює ефектний акцент у композиціях." }],
      },
    ],
    variants: [
      { length: 50, price: 95, stock: 260 },
      { length: 60, price: 110, stock: 180 },
    ],
  },
  {
    name: "Еустома біла",
    slug: "eustoma-bila",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Витончена біла еустома нагадує троянду своєю формою. Довго зберігає свіжість після зрізання." }],
      },
    ],
    variants: [
      { length: 55, price: 80, stock: 340 },
      { length: 65, price: 95, stock: 240 },
    ],
  },
  {
    name: "Півонія рожева",
    slug: "pivoniia-rozheva",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Розкішна рожева півонія з пишними пелюстками. Символ багатства та щастя." }],
      },
    ],
    variants: [
      { length: 50, price: 140, stock: 150 },
      { length: 60, price: 160, stock: 130 },
    ],
  },
  {
    name: "Альстромерія мікс",
    slug: "alstromeriia-miks",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Яскравий мікс альстромерій різних кольорів. Ідеально для створення веселих та барвистих композицій." }],
      },
    ],
    variants: [
      { length: 60, price: 55, stock: 420 },
      { length: 70, price: 68, stock: 310 },
    ],
  },
  {
    name: "Орхідея біла",
    slug: "orkhidieia-bila",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Екзотична біла орхідея - символ розкоші та вишуканості. Ідеальний подарунок для особливих людей." }],
      },
    ],
    variants: [
      { length: 50, price: 180, stock: 90 },
      { length: 60, price: 210, stock: 70 },
    ],
  },
  {
    name: "Танацетум",
    slug: "tanacetum",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Маленькі білі квіточки танацетума додають букету легкості та повітряності. Чудовий філер для композицій." }],
      },
    ],
    variants: [
      { length: 55, price: 48, stock: 360 },
      { length: 65, price: 58, stock: 250 },
    ],
  },
  {
    name: "Спрей-троянда рожева",
    slug: "sprei-troianda-rozheva",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Витончена рожева спрей-троянда з багатьма маленькими квітками на стеблі. Ідеальна для створення об'ємних композицій." }],
      },
    ],
    variants: [
      { length: 50, price: 85, stock: 260 },
      { length: 60, price: 96, stock: 210 },
    ],
  },
  {
    name: "Спрей-троянда біла",
    slug: "sprei-troianda-bila",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Елегантна біла спрей-троянда з численними бутонами. Універсальний вибір для будь-якого букету." }],
      },
    ],
    variants: [
      { length: 50, price: 82, stock: 240 },
      { length: 60, price: 92, stock: 200 },
    ],
  },
  {
    name: "Троянда персикова",
    slug: "troianda-persykova",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Ніжна персикова троянда з теплим відтінком. Ідеально підходить для створення романтичних композицій." }],
      },
    ],
    variants: [
      { length: 60, price: 88, stock: 320 },
      { length: 70, price: 102, stock: 260 },
    ],
  },
  {
    name: "Троянда лавандова",
    slug: "troianda-lavandova",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Унікальна лавандова троянда з незвичайним відтінком. Для тих, хто цінує оригінальність." }],
      },
    ],
    variants: [
      { length: 60, price: 92, stock: 210 },
      { length: 70, price: 110, stock: 180 },
    ],
  },
  {
    name: "Гербера мікс",
    slug: "herbera-miks",
    description: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Веселий мікс гербер яскравих кольорів. Дарує позитивні емоції та піднімає настрій." }],
      },
    ],
    variants: [
      { length: 45, price: 65, stock: 440 },
      { length: 55, price: 78, stock: 320 },
    ],
  },
];

export default async function bootstrap({ strapi }: { strapi: Core.Strapi }) {
  strapi.log.info("📦 Bootstrap loaded");

  // Set up public permissions for API endpoints
  await setupPublicPermissions(strapi);

  // Set up authenticated permissions for API endpoints
  await setupAuthenticatedPermissions(strapi);

  // Reset flowers if RESET_FLOWERS=true (one-time operation)
  if (process.env.RESET_FLOWERS === 'true') {
    strapi.log.warn('⚠️ RESET_FLOWERS=true - deleting all flowers and variants!');
    await resetFlowersAndVariants(strapi);
    strapi.log.info('🔔 Remember to remove RESET_FLOWERS env variable after import!');
    return; // Skip other operations after reset
  }

  // Clean up duplicate records (run once to fix existing duplicates)
  await cleanupDuplicates(strapi);

  // Fix flowers without slugs (uses Documents API to avoid creating duplicates)
  await fixFlowersWithoutSlugs(strapi);

  // Publish all draft flowers (uses Documents API to avoid creating duplicates)
  await publishAllFlowers(strapi);
}

async function setupPublicPermissions(strapi: Core.Strapi) {
  try {
    // Get the public role
    const publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
      where: { type: "public" },
    });

    if (!publicRole) {
      strapi.log.warn("⚠️ Public role not found, skipping permissions setup");
      return;
    }

    // Define the permissions we want to enable for public
    const permissionsToEnable = [
      // POS API
      { action: "api::pos.pos.createSale", enabled: true },
      { action: "api::pos.pos.createWriteOff", enabled: true },
      { action: "api::pos.pos.confirmPayment", enabled: true },
      // Analytics API
      { action: "api::analytics.analytics.getDashboard", enabled: true },
      // Customer API
      { action: "api::customer.customer.find", enabled: true },
      { action: "api::customer.customer.findOne", enabled: true },
      { action: "api::customer.customer.create", enabled: true },
      // Flower API
      { action: "api::flower.flower.find", enabled: true },
      { action: "api::flower.flower.findOne", enabled: true },
      // Variant API
      { action: "api::variant.variant.find", enabled: true },
      { action: "api::variant.variant.findOne", enabled: true },
      // Transaction API
      { action: "api::transaction.transaction.find", enabled: true },
      { action: "api::transaction.transaction.findOne", enabled: true },
      // Import API
      { action: "api::import.import.excel", enabled: true },
      { action: "api::import.import.findOne", enabled: true },
    ];

    // Check existing permissions
    const existingPermissions = await strapi.db.query("plugin::users-permissions.permission").findMany({
      where: { role: publicRole.id },
    });

    const existingActions = new Set(existingPermissions.map((p: { action: string }) => p.action));

    // Add missing permissions
    for (const perm of permissionsToEnable) {
      if (!existingActions.has(perm.action)) {
        await strapi.db.query("plugin::users-permissions.permission").create({
          data: {
            action: perm.action,
            role: publicRole.id,
          },
        });
        strapi.log.info(`✅ Added public permission: ${perm.action}`);
      }
    }

    strapi.log.info("🔐 Public permissions configured");
  } catch (error) {
    strapi.log.error("❌ Error setting up permissions:", error);
  }
}

async function setupAuthenticatedPermissions(strapi: Core.Strapi) {
  try {
    // Get the authenticated role
    const authenticatedRole = await strapi.db.query("plugin::users-permissions.role").findOne({
      where: { type: "authenticated" },
    });

    if (!authenticatedRole) {
      strapi.log.warn("⚠️ Authenticated role not found, skipping permissions setup");
      return;
    }

    // Define the permissions we want to enable for authenticated users
    const permissionsToEnable = [
      // Upload plugin
      { action: "plugin::upload.content-api.upload", enabled: true },
      { action: "plugin::upload.content-api.destroy", enabled: true },
      // POS API
      { action: "api::pos.pos.createSale", enabled: true },
      { action: "api::pos.pos.createWriteOff", enabled: true },
      { action: "api::pos.pos.confirmPayment", enabled: true },
      // Analytics API
      { action: "api::analytics.analytics.getDashboard", enabled: true },
      // Customer API
      { action: "api::customer.customer.find", enabled: true },
      { action: "api::customer.customer.findOne", enabled: true },
      { action: "api::customer.customer.create", enabled: true },
      { action: "api::customer.customer.update", enabled: true },
      // Flower API
      { action: "api::flower.flower.find", enabled: true },
      { action: "api::flower.flower.findOne", enabled: true },
      { action: "api::flower.flower.create", enabled: true },
      { action: "api::flower.flower.update", enabled: true },
      { action: "api::flower.flower.delete", enabled: true },
      // Variant API
      { action: "api::variant.variant.find", enabled: true },
      { action: "api::variant.variant.findOne", enabled: true },
      { action: "api::variant.variant.create", enabled: true },
      { action: "api::variant.variant.update", enabled: true },
      { action: "api::variant.variant.delete", enabled: true },
      // Transaction API
      { action: "api::transaction.transaction.find", enabled: true },
      { action: "api::transaction.transaction.findOne", enabled: true },
      { action: "api::transaction.transaction.create", enabled: true },
      { action: "api::transaction.transaction.update", enabled: true },
      // Import API
      { action: "api::import.import.excel", enabled: true },
      { action: "api::import.import.findOne", enabled: true },
    ];

    // Check existing permissions
    const existingPermissions = await strapi.db.query("plugin::users-permissions.permission").findMany({
      where: { role: authenticatedRole.id },
    });

    const existingActions = new Set(existingPermissions.map((p: { action: string }) => p.action));

    // Add missing permissions
    for (const perm of permissionsToEnable) {
      if (!existingActions.has(perm.action)) {
        await strapi.db.query("plugin::users-permissions.permission").create({
          data: {
            action: perm.action,
            role: authenticatedRole.id,
          },
        });
        strapi.log.info(`✅ Added authenticated permission: ${perm.action}`);
      }
    }

    strapi.log.info("🔐 Authenticated permissions configured");
  } catch (error) {
    strapi.log.error("❌ Error setting up authenticated permissions:", error);
  }
}

async function fixFlowersWithoutSlugs(strapi: Core.Strapi) {
  try {
    strapi.log.info("🔍 Checking for flowers without slugs...");

    // Ukrainian to Latin transliteration
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

    const generateSlug = (name: string): string => {
      return name
        .split('')
        .map(char => translitMap[char] || char)
        .join('')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };

    // Use Documents API to find all flowers
    const flowers = await strapi.documents("api::flower.flower").findMany({
      fields: ["documentId", "name", "slug"],
    });

    let fixedCount = 0;

    for (const flower of flowers) {
      if (!flower.slug && flower.name) {
        const slug = generateSlug(flower.name);

        // Use Documents API update method
        await strapi.documents("api::flower.flower").update({
          documentId: flower.documentId,
          data: { slug },
        });

        strapi.log.info(`🏷️ Fixed slug for flower: "${flower.name}" -> "${slug}"`);
        fixedCount++;
      }
    }

    if (fixedCount > 0) {
      strapi.log.info(`✅ Fixed ${fixedCount} flowers without slugs`);
    } else {
      strapi.log.info(`✅ All flowers have slugs`);
    }
  } catch (error) {
    strapi.log.error("❌ Error fixing flowers without slugs:", error);
  }
}

async function publishAllFlowers(strapi: Core.Strapi) {
  try {
    strapi.log.info("📤 Publishing all unpublished flowers...");

    // Use Documents API to find unpublished flowers (draft status)
    const draftFlowers = await strapi.documents("api::flower.flower").findMany({
      status: "draft",
      fields: ["documentId", "name", "slug"],
    });

    let publishedCount = 0;

    for (const flower of draftFlowers) {
      try {
        // Use Documents API publish() method - this is the correct way in Strapi v5
        await strapi.documents("api::flower.flower").publish({
          documentId: flower.documentId,
        });
        strapi.log.info(`✅ Published flower: "${flower.name}" (${flower.slug})`);
        publishedCount++;
      } catch (error) {
        strapi.log.error(`❌ Error publishing flower "${flower.name}":`, error);
      }
    }

    if (publishedCount > 0) {
      strapi.log.info(`✅ Published ${publishedCount} flowers`);
    } else {
      strapi.log.info(`✅ All flowers are already published`);
    }
  } catch (error) {
    strapi.log.error("❌ Error publishing flowers:", error);
  }
}

/* SEED DISABLED
  try {
    // Перевірка чи є вже дані
    const existingFlowers = await strapi.db.query("api::flower.flower").findMany({});

    if (existingFlowers && existingFlowers.length > 0) {
      strapi.log.info(`Database already contains ${existingFlowers.length} flowers. Skipping seed.`);
      return;
    }

    strapi.log.info("📦 Starting database seed...");

    for (const flowerData of flowersData) {
      const { variants, ...flowerInfo } = flowerData;

      // Створюємо квітку
      const flower = await strapi.db.query("api::flower.flower").create({
        data: {
          ...flowerInfo,
          locale: "en",
          publishedAt: new Date().toISOString(),
        },
      });

      strapi.log.info(`✅ Created flower: ${flower.name}`);

      // Створюємо варіанти для цієї квітки
      for (const variantData of variants) {
        await strapi.db.query("api::variant.variant").create({
          data: {
            ...variantData,
            flower: flower.id,
            locale: "en",
            publishedAt: new Date().toISOString(),
          },
        });
      }
    }

    strapi.log.info(`✨ Seed completed! Created ${flowersData.length} flowers with variants.`);
  } catch (error) {
    strapi.log.error("❌ Error during seed:", error);
  }
  */
