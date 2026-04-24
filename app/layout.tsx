import "./globals.css";
import { draftMode } from "next/headers";
import { Inter } from "next/font/google";
import { EXAMPLE_PATH, CMS_NAME } from "@/lib/constants";
import { TailwindUtilities } from "./_components/tailwind-utilities";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: `Next.js and ${CMS_NAME} Example ${EXAMPLE_PATH}`,
  description: `This is built with Next.js and ${CMS_NAME}.`,
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

function Footer() {
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <div className="container mx-auto px-5">
        <div className="text-red-600">Footer</div>        
      </div>
    </footer>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled } = await draftMode();
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://vercel.live" crossOrigin="anonymous" />
      </head>
      <body>
        <TailwindUtilities />
        {isEnabled && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4" role="alert">
            <p className="font-bold">Preview Mode</p>
            <p>You are viewing draft content. <a href="/api/disable-draft" className="underline">Disable Preview</a></p>
          </div>
        )}
        <section className="min-h-screen">
          {/* <div className="text-red-200">TMP: dev feature under progress </div>  */}
          <main>{children}</main>
          <Footer />
        </section>
        <SpeedInsights />
      </body>
    </html>
  );
}
