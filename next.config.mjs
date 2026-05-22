import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // MDX, three.js etc. are handled via dynamic imports inside src/.
  // Keep this file minimal until a real reason to grow it appears.
  experimental: {
    // Future home for typedRoutes etc. — leave empty for now.
  },
};

export default bundleAnalyzer(nextConfig);
