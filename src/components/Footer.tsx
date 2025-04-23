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
        <footer className="bg-[#f1f1f1] p-5 md:px-[5vw] border border-[#d3d4d4]">
            <div className="flex flex-wrap gap-[10%] border-b-2 border-[#e5e7e8] pb-5">
                <div className="flex flex-col gap-1 pt-5">
                    <h3 className="mt-0 font-bold text-[20px]">{footerLinks[0].title}</h3>
                    {footerLinks.slice(1).map((link, index) => (
                        <Link
                            href={link.ref}
                            key={index}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline text-black"
                        >
                            {link.title}
                        </Link>
                    ))}
                </div>

                <div className="ml-auto flex flex-col items-center pt-5">
                    <span className="flex gap-2">
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
                    </span>
                    <img
                        src="/logo.png"
                        alt="Psycortex Logo"
                        className="max-w-[100px] object-contain mt-2 self-center"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center flex-col sm:flex-row text-center pt-5">
                <p className="pt-2">
                    © {currentYear} Psycortex Appointments. All Rights Reserved.
                </p>
                <span className="flex gap-2 pt-2 sm:pt-0">
                    <Link
                        href="https://psycortex.in/psycortex/privacypolicy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline text-black"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="https://psycortex.in/psycortex/termsandcondition"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline text-black"
                    >
                        Terms & Conditions
                    </Link>
                    <Link
                        href="https://psycortex.in/psycortex/returnpolicy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline text-black"
                    >
                        Refund Policy
                    </Link>
                </span>
            </div>
        </footer>
    );
};

export default Footer;
