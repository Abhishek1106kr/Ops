import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Sentinel AI | Incident Ops",
  description: "AI-Driven Incident Investigation & Automated Mitigation Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-darkBg text-slate-100 font-sans">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
