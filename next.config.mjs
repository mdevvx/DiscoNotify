/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` writes a plain HTML site to /out for GitHub Pages or Netlify.
  output: "export",
  // Pages are written as pay.html, terms.html, etc., so https://yourdomain.com/pay.html works
  // as Paddle's default payment link. Clean URLs like /pay still work on Netlify and GitHub Pages.
  trailingSlash: false,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
