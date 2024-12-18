"use server";

import React from "react";
import Link from "next/link";
import QuickbooksStatus from "~/app/_components/quickbooks/QuickbooksStatus";
import { getServerAuthSession } from "~/server/auth";
import { Button } from "../ui/button";
import { PlusIcon, UserIcon, MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "~/app/_components/ui/sheet";

const NavBar = async () => {
  const session = await getServerAuthSession();

  const NavLinks = () => (
    <>
      {!session?.user && (
        <Link href="/">
          <span className="text-white hover:text-gray-100 transition-colors font-medium">Home</span>
        </Link>
      )}
      {session?.user && (
        <>
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
        </>
      )}
    </>
  );

  return (
    <nav className="bg-[#6cab1f] py-4 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="navOutline" size="icon">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-[#6cab1f]">
                <div className="py-4">
                  <h2 className="text-lg font-semibold text-white">Navigation Menu</h2>
                </div>
                <div className="flex flex-col gap-6 mt-6">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex gap-8">
            <NavLinks />
          </div>

          <div className="flex items-center gap-6">
            {session?.user ? (
              <>
                <Link href={`/users/${session.user.id}`}>
                  <Button
                    variant="navOutline"
                    className="hidden sm:flex"
                  >
                    <UserIcon className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </Link>
                <Link href="/workOrders/create">
                  <Button
                    variant="navOutline"
                    className="hidden sm:flex"
                  >
                    <PlusIcon className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Create Order</span>
                  </Button>
                </Link>
                <div className="hidden sm:block">
                  <QuickbooksStatus />
                </div>
              </>
            ) : (
              <Link href="/api/auth/signin">
                <Button variant="navOutline">
                  LOGIN
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