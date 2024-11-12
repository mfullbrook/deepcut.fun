import { Analytics } from "@vercel/analytics/react"
import { Nunito } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "600"],
});

export const metadata = {
  title: "Deepcut Trail Status",
  description: "A simple status page for the Deepcut Trail",
};

export default function RootLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-nunito tracking-wide antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
