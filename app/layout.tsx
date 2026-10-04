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
  appleWebApp: {
    capable: true,
    title: "Desk",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e7e1d6" },
    { media: "(prefers-color-scheme: dark)", color: "#141210" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("desk-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
