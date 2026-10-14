import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "FixMyBaramati",
  description: "Report and track civic issues in Baramati, Maharashtra",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
