import type { Viewport } from "next";
import { Newsreader, Outfit } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Shell } from "@/components/Shell";
import "./globals.css";

const sans = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-sans" });
const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata = {
  title: "Desk",
  description: "Write an ATS resume from your master profile for each job.",
  appleWebApp: {
    capable: true,
    title: "Desk",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("desk-theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");var nav=window.navigator;var home=window.matchMedia("(display-mode: standalone)").matches||nav.standalone===true;if(home)document.documentElement.setAttribute("data-standalone","true");}catch(e){}`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `html[data-standalone="true"],html[data-standalone="true"] body{position:fixed;inset:0;width:100%;height:100%;min-height:0;margin:0;overflow:hidden}@media (display-mode:standalone){html,body{position:fixed;inset:0;width:100%;height:100%;min-height:0;margin:0;overflow:hidden}}`,
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
