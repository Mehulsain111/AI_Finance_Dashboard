import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export const metadata = {
  title: "Finance Dashboard",
  description: "Track balances, spending, and transactions in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="app-body antialiased">
      
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              var match = document.cookie.match(/(?:^|; )fd_theme=([^;]*)/);
              var enabled = match ? decodeURIComponent(match[1]) === "dark" : false;
              if (enabled) document.documentElement.dataset.bsTheme = "dark";
            } catch (e) {}
          `}
        </Script>
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
