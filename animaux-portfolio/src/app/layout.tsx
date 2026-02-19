import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Inter, Pacifico, Dancing_Script } from "next/font/google";
import "./globals.css";
import { CartProvider } from '@/providers/CartProvider';
import Navigation from '@/components/Navigation';
// import ColorCustomizer from '@/components/ColorCustomizer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: ["400"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dylan Olivier - Photographe Animalier",
  description: "Photographe passionné spécialisé dans les portraits d'animaux. Découvrez mon portfolio et réservez votre séance photo.",
  keywords: "photographe, animaux, portraits, chiens, chats, paris",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${inter.variable} ${pacifico.variable} ${dancingScript.variable} antialiased`}
      >
        <CartProvider>
          <Navigation />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
