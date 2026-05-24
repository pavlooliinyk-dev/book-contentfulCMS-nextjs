/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        pathname: '/**',
      },
      new URL('https://image.tmdb.org/**')
    ],
  },
  // custom contentful-app (reting stars)
  async rewrites() {
    return [
      {
        source: '/contentful-app',
        destination: '/contentful-app/index.html',
      },
    ];
  },
};
