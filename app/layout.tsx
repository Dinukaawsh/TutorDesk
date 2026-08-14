import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { CloudBackground } from "@/components/layout/cloud-background";
import { SplashProvider } from "@/components/layout/splash-screen";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "TutorDesk LMS",
  description: "Learning management for tutors and students",
  icons: {
    icon: "/brand/logo-icon.png",
    apple: "/brand/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${roboto.variable} h-full`}>
      <body suppressHydrationWarning className="min-h-full font-sans antialiased">
        <SplashProvider>
          <CloudBackground>{children}</CloudBackground>
        </SplashProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
