// ~/app/auth/verify-request/page.tsx
export default function VerifyRequest() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Check your email
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        A sign in link has been sent to your email address.
                    </p>
                </div>
            </div>
        </div>
    );
}