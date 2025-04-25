"use client"
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { TestProvider } from "@/context/TestContext";
import { CounsellorProvider } from "@/context/CounsellorContext";
import AuthStateHandler from "../components/AuthStateHandler";
import { ToastContainer } from "react-toastify";
import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";
import { useEffect } from "react";
import { usePathname } from "next/navigation";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  
  return (
    <html lang="en">
      <head>
        <title>Psycortex - Mental Health Services</title>
        <meta
          name="description"
          content="Access expert mental health care and resources"
        />
        <link rel="icon" href="https://psycortex.in/favicon.ico" />
      </head>
      <body
      >
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <AuthProvider>
          <TestProvider>
            <CounsellorProvider>
              <AuthStateHandler>
                <ClientNavbarWrapper />
                <main className="pt-16 min-h-screen">
                  {children}
                </main>
              </AuthStateHandler>
            </CounsellorProvider>
          </TestProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
