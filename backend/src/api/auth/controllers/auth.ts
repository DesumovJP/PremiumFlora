import type { Core } from '@strapi/strapi';
import bcrypt from 'bcryptjs';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async adminLogin(ctx: any) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      return ctx.badRequest('Email та пароль обов\'язкові');
    }

    try {
      strapi.log.info(`Login attempt for email: ${email}`);
      
      // Спочатку шукаємо в Users & Permissions (для ролі Authenticated)
      let user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() },
        populate: ['role'],
      });

      // Якщо не знайдено, спробуємо як є
      if (!user) {
        user = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { email: email },
          populate: ['role'],
        });
      }

      // Якщо не знайдено в Users & Permissions, шукаємо в Admin users
      let adminUser = null;
      if (!user) {
        adminUser = await strapi.db.query('admin::user').findOne({
          where: { email: email.toLowerCase() },
        });

        if (!adminUser) {
          adminUser = await strapi.db.query('admin::user').findOne({
            where: { email: email },
          });
        }
      }

      if (!user && !adminUser) {
        strapi.log.warn(`User not found for email: ${email}`);
        return ctx.unauthorized('Невірний email або пароль');
      }

      // Обробка Users & Permissions користувача
      if (user) {
        strapi.log.info(`User found: ${user.email}, role: ${user.role?.type || 'none'}`);
        
        // Перевіряємо чи користувач підтверджений
        if (user.confirmed === false) {
          strapi.log.warn(`User is not confirmed: ${user.email}`);
          return ctx.unauthorized('Користувач не підтверджений');
        }

        // Перевіряємо чи користувач не заблокований
        if (user.blocked === true) {
          strapi.log.warn(`User is blocked: ${user.email}`);
          return ctx.unauthorized('Користувач заблокований');
        }

        // Перевіряємо пароль
        if (!user.password) {
          strapi.log.error(`User has no password: ${user.email}`);
          return ctx.unauthorized('Помилка аутентифікації');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        strapi.log.info(`Password validation result: ${isValidPassword}`);

        if (!isValidPassword) {
          strapi.log.warn(`Invalid password for email: ${email}`);
          return ctx.unauthorized('Невірний email або пароль');
        }

        // Генеруємо JWT токен для Users & Permissions користувача
        const jwt = strapi.plugin('users-permissions').service('jwt');
        const token = jwt.issue({ id: user.id });

        return ctx.send({
          data: {
            token,
            user: {
              id: user.id,
              email: user.email,
              username: user.username || email,
              role: user.role?.type || 'authenticated',
            },
          },
        });
      }

      // Обробка Admin користувача
      if (adminUser) {
        strapi.log.info(`Admin user found: ${adminUser.email}, isActive: ${adminUser.isActive}`);

        if (!adminUser.isActive) {
          strapi.log.warn(`Admin user is not active: ${adminUser.email}`);
          return ctx.unauthorized('Користувач неактивний');
        }

        if (!adminUser.password) {
          strapi.log.error(`Admin user has no password: ${adminUser.email}`);
          return ctx.unauthorized('Помилка аутентифікації');
        }

        const isValidPassword = await bcrypt.compare(password, adminUser.password);
        strapi.log.info(`Password validation result: ${isValidPassword}`);

        if (!isValidPassword) {
          strapi.log.warn(`Invalid password for email: ${email}`);
          return ctx.unauthorized('Невірний email або пароль');
        }

        // Генеруємо JWT токен для адміна
        const token = strapi.admin.services.token.createJwtToken({ id: adminUser.id });

        return ctx.send({
          data: {
            token,
            user: {
              id: adminUser.id,
              email: adminUser.email,
              username: adminUser.username || email,
              firstname: adminUser.firstname || '',
              lastname: adminUser.lastname || '',
            },
          },
        });
      }
    } catch (error: any) {
      strapi.log.error('Admin login error:', error);
      return ctx.unauthorized(error?.message || 'Невірний email або пароль');
    }
  },
});

