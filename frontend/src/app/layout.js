import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisScrollProvider from "./components/LenisScrollProvider";
import KprMinimalNavbar from "./components/KprMinimalNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ferrari F1",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <KprMinimalNavbar />
        <LenisScrollProvider>{children}</LenisScrollProvider>
      </body>
    </html>
  );
}
