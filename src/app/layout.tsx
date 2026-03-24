import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repo Delivery",
  description: "SaaS de delivery multi-tenant preparado para produção."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
