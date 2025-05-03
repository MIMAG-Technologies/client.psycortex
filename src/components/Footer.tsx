import React from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

interface FooterLink {
  title: string;
  ref: string;
}

const Footer: React.FC = () => {
  const footerLinks: FooterLink[] = [
    { title: "Psycortex Appointments", ref: "heading" },
    { title: "About", ref: "https://psycortex.in/aboutus/about" },
    { title: "Careers", ref: "#" },
    { title: "Offices", ref: "https://psycortex.in/contactus" },
  ];

  const socialLinks: Record<string, string> = {
    facebook: "https://www.facebook.com/psycortex.bt?mibextid=rS40aB7S9Ucbxw6v",
    twitter: "https://x.com/PPsycortex",
    linkedin: "http://www.linkedin.com/in/psycortex-private-limited-720289301",
    youtube: "https://www.youtube.com/@psycortex_private_limited",
    instagram: "https://www.instagram.com/psycortex_pvt_ltd/",
  };

  const currentYear: number = new Date().getFullYear();

  return (
    <footer className="bg-[#f1f1f1] px-5 py-8 md:px-[5vw] border border-[#d3d4d4]">
      <div className="flex flex-col md:flex-row justify-between gap-8 border-b-2 border-[#e5e7e8] pb-6">
        {/* Left Column - Company Info */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-xl">Psycortex Pvt Ltd</h3>
            <a href="mailto:care@psycortex.in" className="text-sm text-black no-underline">
            Email: care@psycortex.in
            </a>
            <a href="tel:+918767027078" className="text-sm text-black no-underline">
            Phone: 8767027078
            </a>
        </div>

        {/* Right Column - Links and Socials */}
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-xl">{footerLinks[0].title}</h3>
          <div className="flex flex-col gap-1">
            {footerLinks.slice(1).map((link, index) => (
              <Link
                href={link.ref}
                key={index}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline text-black text-sm"
              >
                {link.title}
              </Link>
            ))}
          </div>

          {/* Social Icons at bottom */}
          <div className="flex gap-3 mt-4">
            <Link
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 flex items-center justify-center text-white bg-black rounded-full"
            >
              <FaFacebookF size={18} />
            </Link>
            <Link
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 flex items-center justify-center text-white bg-black rounded-full"
            >
              <FaLinkedinIn size={18} />
            </Link>
            <Link
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 flex items-center justify-center text-white bg-black rounded-full"
            >
              <FaTwitter size={18} />
            </Link>
            <Link
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 flex items-center justify-center text-white bg-black rounded-full"
            >
              <FaYoutube size={18} />
            </Link>
            <Link
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 flex items-center justify-center text-white bg-black rounded-full"
            >
              <FaInstagram size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-center pt-5">
        <p className="text-sm text-black">
          © {currentYear} Psycortex Appointments. All Rights Reserved.
        </p>
        <div className="flex gap-3 flex-wrap justify-center pt-2 sm:pt-0">
          <Link
            href="https://psycortex.in/psycortex/privacypolicy"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline text-black text-sm"
          >
            Privacy Policy
          </Link>
          <Link
            href="https://psycortex.in/psycortex/termsandcondition"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline text-black text-sm"
          >
            Terms & Conditions
          </Link>
          <Link
            href="https://psycortex.in/psycortex/returnpolicy"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline text-black text-sm"
          >
            Refund Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
