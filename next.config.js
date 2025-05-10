/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: [
        'otx.alienvault.com',
        'api.abuseipdb.com',
        'api.greynoise.io',
      ],
    },
    experimental: {
      serverActions: true,
    },
    // For BetterAuth compatibility
    webpack: (config) => {
      config.externals = [...(config.externals || []), { bcrypt: 'bcrypt' }];
      return config;
    },
  };
  
  module.exports = nextConfig;