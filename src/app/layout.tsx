import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin", "cyrillic"], variable: "--font-oswald" });

export const metadata: Metadata = {
    title: "Зрада чи Перемога?",
    description: "Державний реєстр визначення долі",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="uk" suppressHydrationWarning>
        <body className={`${inter.variable} ${oswald.variable} antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}