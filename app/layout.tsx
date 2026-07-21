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
  icons: {
    icon: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6WHca2xBvrLFfzPVz7j1xzPdu9IL2Kdb9sMyZgGbDud6M-hAAY62zasamdrdZ1rGwnkSozAmdsiaHwu-HMl52ruoSf4bQvwge8_LFWITHzmRC5gUH5eOdV3MBIQ5RsW-0BOfDMFT0WR6WmocJfrLjkNNxMMXWvnP2XQTGSXOinybCbtaa4qxQYxcMMzPpE_MTRCH5KjBrLCb4RdGERtFQiH63NzNEjJDcqzlCKk_ZQmU_yp3hM2FbO4FdY4tMWnz9yq1Txy_2T2Y",
    shortcut: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6WHca2xBvrLFfzPVz7j1xzPdu9IL2Kdb9sMyZgGbDud6M-hAAY62zasamdrdZ1rGwnkSozAmdsiaHwu-HMl52ruoSf4bQvwge8_LFWITHzmRC5gUH5eOdV3MBIQ5RsW-0BOfDMFT0WR6WmocJfrLjkNNxMMXWvnP2XQTGSXOinybCbtaa4qxQYxcMMzPpE_MTRCH5KjBrLCb4RdGERtFQiH63NzNEjJDcqzlCKk_ZQmU_yp3hM2FbO4FdY4tMWnz9yq1Txy_2T2Y",
    apple: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6WHca2xBvrLFfzPVz7j1xzPdu9IL2Kdb9sMyZgGbDud6M-hAAY62zasamdrdZ1rGwnkSozAmdsiaHwu-HMl52ruoSf4bQvwge8_LFWITHzmRC5gUH5eOdV3MBIQ5RsW-0BOfDMFT0WR6WmocJfrLjkNNxMMXWvnP2XQTGSXOinybCbtaa4qxQYxcMMzPpE_MTRCH5KjBrLCb4RdGERtFQiH63NzNEjJDcqzlCKk_ZQmU_yp3hM2FbO4FdY4tMWnz9yq1Txy_2T2Y",
  }
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
          position="top-center"
          toastOptions={{
            className: "bg-white text-on-surface border border-outline-variant/30 rounded-xl font-body-md shadow-lg",
          }}
        />
      </body>
    </html>
  );
}

