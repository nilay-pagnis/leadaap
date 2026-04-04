/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/leads",
        destination: "/inbox",
        permanent: true,
      },
      {
        source: "/leads/:path*",
        destination: "/inbox/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/admin",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/dashboard/admin/:path*",
        destination: "/admin/:path*",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/f/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
