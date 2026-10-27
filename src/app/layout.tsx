import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tulisin",
  description: "Asisten penulisan akademik untuk Microsoft Word",
};

const OFFICE_JS_URL = "https://appsforoffice.microsoft.com/lib/1/hosted/office.js";

// Inside Office hosts, office.js nulls history.pushState/replaceState, which breaks
// the Next.js router. Save them before office.js loads and restore them after.
const SAVE_HISTORY = `window.__tulisinHistory={pushState:history.pushState,replaceState:history.replaceState};`;
const RESTORE_HISTORY = `if(window.__tulisinHistory){history.pushState=window.__tulisinHistory.pushState;history.replaceState=window.__tulisinHistory.replaceState;}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* beforeInteractive scripts run in order, before hydration. */}
        <Script id="save-history" strategy="beforeInteractive">
          {SAVE_HISTORY}
        </Script>
        <Script src={OFFICE_JS_URL} strategy="beforeInteractive" />
        <Script id="restore-history" strategy="beforeInteractive">
          {RESTORE_HISTORY}
        </Script>
        {children}
      </body>
    </html>
  );
}
