import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";

// EB Garamond - Classic serif font for Boar's Head branding
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-garamond",
});

export const metadata: Metadata = {
  title: "Boar's Head Policy Copilot",
  description: "Enterprise decision support system for policy-backed operational guidance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ebGaramond.variable} font-sans antialiased`}
        style={{ fontFamily: 'var(--font-garamond), Georgia, serif' }}
      >
        {children}
      </body>
    </html>
  );
}
