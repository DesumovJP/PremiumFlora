export default () => {
  return async (ctx: any, next: () => Promise<void>) => {
    // Ensure x-forwarded-proto is set for Railway proxy
    if (!ctx.request.header['x-forwarded-proto'] || ctx.request.header['x-forwarded-proto'] !== 'https') {
      ctx.request.header['x-forwarded-proto'] = 'https';
    }
    
    // Set x-forwarded-host from host header if not present
    if (!ctx.request.header['x-forwarded-host'] && ctx.request.header.host) {
      ctx.request.header['x-forwarded-host'] = ctx.request.header.host;
    }
    
    // Ensure host header is set correctly for Strapi admin URL resolution
    if (ctx.request.header.host && !ctx.request.header.host.includes('localhost')) {
      // In production, ensure we're using the correct host
      const host = ctx.request.header['x-forwarded-host'] || ctx.request.header.host;
      if (host) {
        ctx.request.header.host = host;
      }
    }
    
    await next();
  };
};
