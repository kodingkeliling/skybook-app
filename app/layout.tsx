import type { Metadata } from "next";
import { Epilogue, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const epilogue = Epilogue({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-epilogue",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Skybook - Tebak Foto Masa Kecil",
  description: "Setiap gambar ada cerita. Tunjukan pesona kalian ke isi kantor Skyshi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="light">
      <body
        className={`${epilogue.variable} ${manrope.variable} antialiased bg-surface text-on-surface min-h-screen pb-20`}
        style={{
          fontFamily: "var(--font-manrope), Manrope, sans-serif",
        }}
      >
        {children}

        <Toaster
          position="bottom-center"
          toastOptions={{
            className: "bg-surface-container-highest text-on-surface border-none rounded-xl font-body-md",
          }}
        />
      </body>
    </html>
  );
}

