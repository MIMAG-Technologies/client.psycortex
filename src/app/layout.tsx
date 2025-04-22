import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import AuthStateHandler from "../components/AuthStateHandler";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <AuthProvider>
          <AuthStateHandler>
            <Navbar />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
          </AuthStateHandler>
        </AuthProvider>
      </body>
    </html>
  );
}
