// ~/src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getServerAuthSession } from "~/server/auth";
import QuickbooksAuth from "~/app/_components/quickbooks/QuickbooksAuth";
import { api } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getServerAuthSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#6cab1f] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <Image
          priority={true}
          src="/images/ThomsonLogo.png"
          alt="Thomson Print Portal"
          width={432}
          height={277}
        />
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl text-white">
            {hello ? 'Welcome!' : "Loading tRPC query..."}
          </p>

          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-2xl text-white">
              {session && <span>Logged in as {session.user?.name}</span>}
            </p>
            {/* <div className="text-center text-2xl text-white">
              {session && (
                <Link className="btn btn-primary" href="/dashboard">
                  Go to dashboard
                </Link>
              )}
              <br />
              {session && (
                <Link className="btn btn-primary" href="/users">
                  Go to users
                </Link>
              )}
              {session && (
                <Link className="btn btn-primary" href="/orders">
                  Go to orders
                </Link>
              )}
              {session && (
                <QuickbooksAuth />
              )}
            </div> */}
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="btn btn-primary"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}