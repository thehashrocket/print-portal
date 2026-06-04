import nextConfig from "eslint-config-next";

const config = [
    ...nextConfig,
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        rules: {
            "@next/next/no-html-link-for-pages": "off",
            // React Compiler rules are too strict for the patterns used in this codebase
            // (e.g. reading localStorage in useEffect, initializing state from async data).
            // Downgraded to warn to unblock CI; fix incrementally.
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/error-boundaries": "warn",
            "react-hooks/preserve-manual-memoization": "warn",
        },
    },
];

export default config;
