import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Orbitron, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "J.A.R.V.I.S Assistant",
  description: "Design sandbox. Live Desktop/JARVIS is not modified.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} ${orbitron.variable} ${jetbrains.variable} font-sans antialiased bg-background text-foreground overflow-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
