import "~/styles/globals.css";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { ServiceWorkerRegistration } from './_components/ServiceWorkerRegistration';
import { InstallPWA } from '~/app/_components/installPWA';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata = {
  title: "Thomson Printing Platform",
  description: "Built by Jason Shultz",
  icons: [{ rel: "icon", url: "/images/favicon-196x196.png" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Thomson Printing Portal" />
        <meta name="mobile-web-app-title" content="Thomson Printing Portal" />
        <link rel="apple-touch-icon" href="/images/favicon-196x196.png" />
      </head>
      <body>
        <TRPCReactProvider>
          <Providers>
            {children}
            <InstallPWA />
            <ServiceWorkerRegistration />
          </Providers>
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
