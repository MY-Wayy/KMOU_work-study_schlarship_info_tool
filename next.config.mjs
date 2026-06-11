/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // Static HTML export
  trailingSlash: true,   // Needed for GitHub Pages routing
  basePath: '/KMOU_work-study_schlarship_info_tool',
  assetPrefix: '/KMOU_work-study_schlarship_info_tool',
  images: {
    unoptimized: true,   // Required for static export
  },
};

export default nextConfig;
