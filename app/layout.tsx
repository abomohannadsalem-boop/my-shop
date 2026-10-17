import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";

import "./globals.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import { createClient } from "@/lib/supabase/server";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Golden Lion | فروشگاه آنلاین",
  description: "فروشگاه آنلاین Golden Lion؛ مشاهده و خرید محصولات متنوع.",
  icons: { icon: "/golden-lion-favicon.png", shortcut: "/golden-lion-favicon.png", apple: "/golden-lion-favicon.png" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name");

  return (
    <html
      lang="fa"
      dir="rtl"
      className={vazirmatn.variable}
    >
      <body className="min-h-screen bg-gray-50 font-vazirmatn">

        <Header categories={categories ?? []} />

        <main className="min-h-screen">
          {children}
        </main>

        <Footer />

      </body>
    </html>
  );
}