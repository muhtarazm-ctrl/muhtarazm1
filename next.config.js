/** @type {import('next').NextConfig} */
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
