import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/navigation/BottomNav"; // Import the nav
import EmailVerificationGate from "@/components/EmailVerificationGate";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "KasiJobs",
  description: "Cari makan, buat duit.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KasiJobs",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-kasi-gray text-kasi-dark`}>
        {/* The Mobile Container */}
        <main className="w-full min-h-screen"> 
          <EmailVerificationGate />
          {children}
          
          {/* Add Navigation Bar Here */}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
