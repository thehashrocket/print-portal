"use server";

import React from "react";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";

const NavBar = async () => {
  const session = await getServerAuthSession();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Link href="/">
              <span className="text-white">Home</span>
            </Link>
            <Link href="/companies">
              <span className="text-white">Companies</span>
            </Link>
            <Link href="/dashboard">
              <span className="text-white">Dashboard</span>
            </Link>
            <Link href="/orders">
              <span className="text-white">Orders</span>
            </Link>
            <Link href="/workOrders">
              <span className="text-white">Work Orders</span>
            </Link>
            <Link href="/users">
              <span className="text-white">Users</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {session?.user && (
              <Link href={`/users/${session.user.id}`}>
                <span className="text-white hover:text-gray-300">Profile</span>
              </Link>
            )}
            {/* Add additional elements like logout button, etc. */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;