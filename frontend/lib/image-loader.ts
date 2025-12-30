// Custom image loader for DigitalOcean Spaces
// Bypasses Next.js image optimization which fails due to NAT64 resolving to "private" IP

export const digitalOceanLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => {
  // Return the original URL without optimization
  // DigitalOcean Spaces CDN is already fast
  return src;
};

// Check if URL is from DigitalOcean Spaces
export const isDigitalOceanImage = (src: string): boolean => {
  return src.includes('digitaloceanspaces.com');
};
