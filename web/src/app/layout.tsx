import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ThemeProvider from "@/components/ThemeProvider";
import BottomNav from "@/components/BottomNav";
import TopHeader from "@/components/TopHeader";
import Drawer from "@/components/Drawer";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/hooks/useSidebar";
import SidebarAwareMain from "@/components/SidebarAwareMain";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
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
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-poly-bg min-h-screen`}
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
