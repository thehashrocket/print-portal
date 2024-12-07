"use server";

import React from "react";
import Link from "next/link";
import QuickbooksStatus from "~/app/_components/quickbooks/QuickbooksStatus";
import { getServerAuthSession } from "~/server/auth";
import { Button } from "../ui/button";

const NavBar = async () => {
  const session = await getServerAuthSession();

  return (
    <nav className="bg-[#6cab1f] py-4 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="flex gap-8"> {/* Increased gap from space-x-4 to gap-8 */}
            {!session?.user && (
              <Link href="/">
                <span className="text-white hover:text-gray-100 transition-colors font-medium">Home</span>
              </Link>
            )}
            <Link href="/companies">
              <span className="text-white hover:text-gray-100 transition-colors font-medium">Companies</span>
            </Link>
            <Link href="/dashboard">
              <span className="text-white hover:text-gray-100 transition-colors font-medium">Dashboard</span>
            </Link>
            <Link href="/workOrders">
              <span className="text-white hover:text-gray-100 transition-colors font-medium">Estimates</span>
            </Link>
            <Link href="/invoices">
              <span className="text-white hover:text-gray-100 transition-colors font-medium">Invoices</span>
            </Link>
            <Link href="/orders">
              <span className="text-white hover:text-gray-100 transition-colors font-medium">Orders</span>
            </Link>
            <Link href="/users">
              <span className="text-white hover:text-gray-100 transition-colors font-medium">Users</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6"> {/* Increased gap from space-x-4 to gap-6 */}
            {session?.user ? (
              <>
                <Link href={`/users/${session.user.id}`}>
                  <span className="text-white hover:text-gray-100 transition-colors font-medium">Profile</span>
                </Link>
                <Link href="/workOrders/create">
                  <span className="btn btn-sm btn-primary px-4 text-white hover:opacity-90 transition-opacity">Create Order</span>
                </Link>
                <QuickbooksStatus />
              </>
            ) : (
              <Link href="/api/auth/signin">
                <Button
                  variant="outline"
                > 
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;