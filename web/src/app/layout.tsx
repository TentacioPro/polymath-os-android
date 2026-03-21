import type { Metadata } from "next";
import { DM_Sans, Inter, Outfit, Space_Grotesk, JetBrains_Mono, Space_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ThemeProvider from "@/components/ThemeProvider";
import BottomNav from "@/components/BottomNav";
import TopHeader from "@/components/TopHeader";
import Drawer from "@/components/Drawer";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/hooks/useSidebar";
import SidebarAwareMain from "@/components/SidebarAwareMain";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Polymath OS",
  description: "Track, Learn, Connect — your polymathic journey on the web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-black" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${dmSans.variable} ${inter.variable} ${outfit.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${spaceMono.variable} antialiased bg-poly-bg min-h-screen`}
      >
        <Providers>
          <ThemeProvider>
            <SidebarProvider>
            {/* Mobile-only: hamburger drawer overlay */}
            <Drawer />
            {/* Mobile-only: top header with hamburger */}
            <TopHeader />
            {/* Desktop: persistent sidebar (hidden on mobile) */}
            <AppSidebar />

            {/* Main content area — offset by sidebar on md+ */}
            <SidebarAwareMain>
              {children}
            </SidebarAwareMain>

            {/* Mobile-only: floating bottom pill nav */}
            <BottomNav />
            </SidebarProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
