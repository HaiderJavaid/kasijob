import { createRequire } from 'node:module';
import withPWAInit from '@ducanh2912/next-pwa';

const require = createRequire(import.meta.url);

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-joyride$': require.resolve('react-joyride'),
    };

    return config;
  },
};

export default withPWA(nextConfig);
