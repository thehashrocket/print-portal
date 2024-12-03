// ~/app/_components/noPermission/noPremission.tsx

// No permission component
"use client";

import React from "react";

const NoPermission = () => {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Oops! You don&apos;t have permission to view this page.</h1>
            <p className="mb-6">But don&apos;t worry, this cute dog is here to keep you company!</p>
            <img
                src="https://placedog.net/500?random"
                alt="Cute dog"
                className="mx-auto mb-6 rounded-lg shadow-lg"
                style={{ maxWidth: "400px" }}
            />
            <p className="text-gray-600">Maybe try logging in or contact the administrator if you think this is a mistake.</p>
        </div>
    );
};

export default NoPermission;
