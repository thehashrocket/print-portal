// ~/app/auth/signin/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("Sending magic link...");
        const result = await signIn("email", { email, callbackUrl: "/dashboard", redirect: false });
        if (result?.error) {
            setMessage("Error: " + result.error);
        } else {
            setMessage("Check your email for the magic link!");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    {error && (
                        <p className="mt-2 text-center text-sm text-red-600">
                            {error === "EmailSignin" ? "Check your email for the magic link!" : error}
                        </p>
                    )}
                    {message && (
                        <p className="mt-2 text-center text-sm text-blue-600">
                            {message}
                        </p>
                    )}
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" defaultValue="true" />
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Sign in with Email
                        </button>
                    </div>
                </form>
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                            <img
                                className="h-5 w-5 mr-2"
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                alt="Google logo"
                            />
                            Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}