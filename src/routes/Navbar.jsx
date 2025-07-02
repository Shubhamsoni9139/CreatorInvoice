import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { session } = UserAuth();
  const [creator, setCreator] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

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
    } catch (err) {
      console.error("Sign out error:", err.message);
    }
  };

  return (
    <header className="absolute inset-x-0 top-0 z-50 w-full">
      <div className="px-4 mx-auto sm:px-6 lg:px-8 bg-gradient-to-r from-green-300 to-black rounded-full mt-2 ml-2 mr-2 shadow-md">
        <div className="flex items-center justify-between h-16 lg:h-20 relative">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl font-extrabold text-black">
                CreatorIn
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex lg:items-center lg:space-x-10">
            <Link
              to="/dashboard/items"
              className="text-base text-black hover:text-opacity-80 transition"
            >
              Items
            </Link>
            <Link
              to="/dashboard/customer"
              className="text-base text-black hover:text-opacity-80 transition"
            >
              Customer
            </Link>
            <Link
              to="/dashboard/invoice"
              className="text-base text-black hover:text-opacity-80 transition"
            >
              Create
            </Link>
            <Link
              to="/dashboard/all"
              className="text-base text-black hover:text-opacity-80 transition"
            >
              Invoices
            </Link>
          </div>

          {/* Buttons - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={handleSignOut}
              className="text-base text-white hover:text-opacity-80 transition"
            >
              Sign Out
            </button>
            <Link
              to="/dashboard/profile"
              className="px-4 py-2 text-sm font-semibold text-white bg-white/20 hover:bg-white/40 rounded-lg transition"
            >
              Profile
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-black bg-white/40 hover:bg-white/60 rounded-md"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                key="mobile-menu"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
                }}
                className="lg:hidden absolute left-0 right-0 top-full z-40 mt-1 px-4 space-y-2 pb-4 bg-gradient-to-r from-black to-green-900 rounded-b-xl shadow-lg text-sm text-white"
              >
                <Link
                  to="/dashboard/items"
                  className="block px-4 py-2 rounded-md bg-white/10 hover:bg-white/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Items
                </Link>
                <Link
                  to="/dashboard/customer"
                  className="block px-4 py-2 rounded-md bg-white/10 hover:bg-white/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Customer
                </Link>
                <Link
                  to="/dashboard/invoice"
                  className="block px-4 py-2 rounded-md bg-white/10 hover:bg-white/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create
                </Link>
                <Link
                  to="/dashboard/all"
                  className="block px-4 py-2 rounded-md bg-white/10 hover:bg-white/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Invoices
                </Link>
                <hr className="border-white/20 my-2" />
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 rounded-md bg-white/10 hover:bg-white/20"
                >
                  Sign Out
                </button>
                <Link
                  to="/dashboard/profile"
                  className="block px-4 py-2 rounded-md bg-white/10 hover:bg-white/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </header>
  );
};

export default Navbar;
