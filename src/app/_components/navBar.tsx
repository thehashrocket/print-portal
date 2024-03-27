import React from "react";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <Link href="/">
              <span className="text-white">Home</span>
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
          {/* Add additional elements like user profile, logout button, etc. */}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
