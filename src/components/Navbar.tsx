"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaHome, FaUserMd, FaClipboardList, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll event for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close mobile menu when a link is clicked
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-sm"}`}>
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Psycortex Logo"
                width={50}
                height={50}
                priority
              />
              {/* <span 
                className="ml-2 text-3xl text-[#702d8a] font-bold"
              >Psycortex</span> */}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/" icon={<FaHome />} label="Home" active={pathname === "/"} onClick={closeMenu} />
            <NavLink href="/experts" icon={<FaUserMd />} label="Experts" active={pathname === "/experts"} onClick={closeMenu} />
            <NavLink href="/tests" icon={<FaClipboardList />} label="Tests" active={pathname === "/tests"} onClick={closeMenu} />
            {user ? (
              <NavLink href="/profile" icon={<FaUser />} label="My Profile" active={pathname === "/profile"} onClick={closeMenu} />
            ) : (
              <NavLink href="/login" icon={<FaUser />} label="Login" active={pathname === "/login"} onClick={closeMenu} />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-60" : "max-h-0 overflow-hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
          <MobileNavLink href="/" icon={<FaHome />} label="Home" active={pathname === "/"} onClick={closeMenu} />
          <MobileNavLink href="/experts" icon={<FaUserMd />} label="Experts" active={pathname === "/experts"} onClick={closeMenu} />
          <MobileNavLink href="/tests" icon={<FaClipboardList />} label="Tests" active={pathname === "/tests"} onClick={closeMenu} />
          {user ? (
            <MobileNavLink href="/profile" icon={<FaUser />} label="My Profile" active={pathname === "/profile"} onClick={closeMenu} />
          ) : (
            <MobileNavLink href="/login" icon={<FaUser />} label="Login" active={pathname === "/login"} onClick={closeMenu} />
          )}
        </div>
      </div>
    </nav>
  );
};

// Desktop Nav Link component
const NavLink = ({ 
  href, 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-1xl font-medium transition-colors ${
        active 
          ? "text-indigo-700 hover:text-indigo-800" 
          : "text-gray-700 hover:text-indigo-600"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

// Mobile Nav Link component
const MobileNavLink = ({ 
  href, 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium w-full ${
        active 
          ? "bg-indigo-50 text-indigo-700" 
          : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default Navbar; 