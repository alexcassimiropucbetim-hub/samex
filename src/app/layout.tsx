import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { InstallPrompt } from "@/components/InstallPrompt";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAMEX - Sistema de Agendamento Musical e Exames",
  description: "Gerenciamento de testes musicais premium",
  manifest: "/manifest.json",
  icons: {
    icon: "/api/config/favicon",
    apple: "/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#224465",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased flex`}
      >
        <main className="flex-1 min-h-screen">
          {children}
        </main>
        <InstallPrompt />
      </body>
    </html>
  );
}
