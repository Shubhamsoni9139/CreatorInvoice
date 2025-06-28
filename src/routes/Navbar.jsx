import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
const Navbar = () => {
  const { session } = UserAuth();
  const [creator, setCreator] = useState(null);

  // Fetch creator data
  const fetchCreator = async () => {
    try {
      if (!session?.user?.id) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/creators?user_id=eq.${
          session.user.id
        }&select=*`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setCreator(data[0]);
      }
    } catch (err) {
      console.error("Error fetching creator:", err);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchCreator();
    }
  }, [session]);

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log("Successfully signed out!");
      // Optionally redirect the user
      // navigate("/login"); or window.location.href = "/login";
    } catch (err) {
      console.error("Sign out error:", err.message);
    }
  };

  return (
    <header className="absolute inset-x-0 top-0 z-10 w-full">
      <div className="px-4 mx-auto sm:px-6 lg:px-8 bg-gradient-to-r from-green-300 to-black rounded-full mt-2 ml-2 mr-2">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex-shrink-0">
            <Link to="/dashboard" className="flex">
              <img
                className="w-full h-15"
                src="https://framerusercontent.com/images/htoS18uygJMvEeokrXH2TSdQGg0.png"
                alt="Logo"
              />
            </Link>
          </div>

          <div className="hidden lg:flex lg:items-center lg:justify-center lg:space-x-10 ml-5">
            <Link
              to="/dashboard/items"
              className="text-base text-black transition-all duration-200 hover:text-opacity-80"
            >
              Items
            </Link>
            <Link
              to="/dashboard/customer"
              className="text-base text-black transition-all duration-200 hover:text-opacity-80"
            >
              Customer
            </Link>
            <Link
              to="/dashboard/invoice"
              className="text-base text-black transition-all duration-200 hover:text-opacity-80"
            >
              Create
            </Link>
            <Link
              to="/dashboard/all"
              className="text-base text-black transition-all duration-200 hover:text-opacity-80"
            >
              Invoices
            </Link>
          </div>

          <div className="lg:flex lg:items-center lg:justify-end lg:space-x-6 sm:ml-auto">
            <button
              onClick={handleSignOut}
              className="hidden text-base text-white transition-all duration-200 lg:inline-flex hover:text-opacity-80"
            >
              Sign Out
            </button>
            <Link
              to="/dashboard/profile"
              className="inline-flex items-center justify-center px-3 sm:px-5 py-2.5 text-sm sm:text-base font-semibold transition-all duration-200 text-white bg-white/20 hover:bg-white/40 focus:bg-white/40 rounded-lg"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
