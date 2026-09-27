import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NexaERP — Enterprise operations",
    template: "%s · NexaERP",
  },
  description:
    "NexaERP is a polished enterprise resource planning UI demo — a portfolio prototype covering employees, inventory, customers, sales, finance, projects and reporting in one operations hub.",
  openGraph: {
    title: "NexaERP — Enterprise operations",
    description:
      "A polished ERP product UI demo: employees, inventory, finance, projects and reporting in one operations hub.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#070b12",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable}`}
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("nexaerp-theme");document.documentElement.classList.toggle("light",t==="light")}catch(e){}`,
          }}
        />
        <div className="app-bg" aria-hidden />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}