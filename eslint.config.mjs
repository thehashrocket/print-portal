import nextConfig from "eslint-config-next";

const config = [
    ...nextConfig,
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        rules: {
            "@next/next/no-html-link-for-pages": "off",
        },
    },
];

export default config;
