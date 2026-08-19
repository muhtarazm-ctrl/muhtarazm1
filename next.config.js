/** @type {import('next').NextConfig} */
process.env.NEXT_TELEMETRY_DISABLED = '1';

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // التجاوز القسري لمعالجة الصفحات أثناء البناء
  staticPageGenerationTimeout: 1000,
};

module.exports = nextConfig;
