import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "@fontsource/press-start-2p";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

// OVERRIDE per game
export const metadata: Metadata = {
  title: "Bias Buster — AI Ethics in Your Hands",
  description: "Learn AI ethics through branching narrative gameplay — by DareDev256",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={playfair.variable}>
      <body className="min-h-screen bg-game-black antialiased">
        <div className="crt-overlay" />
        {children}
      </body>
    </html>
  );
}
