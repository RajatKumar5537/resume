import type { Viewport } from "next";
import { Newsreader, Outfit } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Shell } from "@/components/Shell";
import "./globals.css";

const sans = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });
const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

export const metadata = {
  title: "Desk",
  description: "Write an ATS resume from your master profile for each job.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
