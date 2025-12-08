/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    // Turbopack struggles with pino's thread-stream dependency (it tries to parse the package's tests).
    // Mark these logging packages as externals so they stay as runtime Node deps instead of being bundled.
    serverExternalPackages: ['pino', 'thread-stream', 'sonic-boom'],
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
