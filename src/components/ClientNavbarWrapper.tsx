'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ClientNavbarWrapper() {
  const pathname = usePathname();
  const showNavbar = !pathname.startsWith('/assesment');
  
  return showNavbar ? <Navbar /> : null;
} 