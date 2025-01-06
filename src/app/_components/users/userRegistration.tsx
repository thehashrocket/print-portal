// ~/app/_components/users/userRegistration.tsx
// This component is for user registration
// It will be used to create a new user in the database
// It will allow users to sign up with their email and password
// We use next-auth to handle the authentication
// We use zod to validate the input
// We use react-hot-toast to show the error messages

// We use the api.user.create to create a new user
// We use the api.user.getByEmail to check if the email is already in use

"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "~/app/_components/ui/card";
import { Label } from "~/app/_components/ui/label";
import type { TRPCClientErrorLike } from '@trpc/client';
import type { AppRouter } from "~/server/api/root";

const userSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function UserRegistration() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createUserMutation = api.users.create.useMutation({
        onSuccess: () => {
            toast.success("Registration successful! Please sign in.");
            router.push("/api/auth/signin");
        },
        onError: (error: TRPCClientErrorLike<AppRouter>) => {
            toast.error(error.message ?? "Failed to create account");
            setIsSubmitting(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            // Validate form data
            const validatedData = userSchema.parse({ email, password, confirmPassword });
            
            // Attempt to create user
            // await createUser.mutateAsync({
            //     email: validatedData.email,
            //     password: validatedData.password,
            // });

            console.log('validatedData', validatedData);
            createUserMutation.mutate({
                email: validatedData.email,
                password: validatedData.password,
            });

        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: { [key: string]: string } = {};
                error.errors.forEach((err) => {
                    if (err.path[0] !== undefined) {
                        formattedErrors[err.path[0].toString()] = err.message;
                    }
                });
                setErrors(formattedErrors);
            }
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <h2 className="text-center text-3xl font-bold tracking-tight">
                        Create your account
                    </h2>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                placeholder="Create a password"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                                className={errors.password ? "border-red-500" : ""}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                disabled={isSubmitting}
                                className={errors.confirmPassword ? "border-red-500" : ""}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                            variant="default"
                        >
                            {isSubmitting ? 'Creating account...' : 'Sign up'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}