/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    allowedDevOrigins: ["http://localhost:3005", "http://localhost:3000", "https://print-portal.1905newmedia.com", "https://client-frontend.ngrok.io", "https://placedog.net", '*.ngrok.io', '*.ngrok-free.app'],
    images: {
        remotePatterns: [
            {
                hostname: "localhost",
            },
            {
                hostname: "client-frontend.ngrok.io",
            },
            {
                hostname: "print-portal.1905newmedia.com",
            },
            {
                hostname: "placedog.net",
            },
            {
                protocol: 'https',
                hostname: '*.ngrok.io',
            },
            {
                protocol: 'https',
                hostname: '*.ngrok-free.app',
            },
        ],
    },
};

export default config;
