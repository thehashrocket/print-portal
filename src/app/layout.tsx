import "~/styles/globals.css";
import Script from 'next/script';
import NavBar from "./_components/shared/navBar"; // Fix the casing of the file name
import { CopilotKit } from "@copilotkit/react-core"; 
import "@copilotkit/react-ui/styles.css";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { ServiceWorkerRegistration } from './_components/ServiceWorkerRegistration';
import { InstallPWA } from '~/app/_components/installPWA'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
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
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Print Portal" />
        <link rel="apple-touch-icon" href="/images/favicon-196x196.png" />
      </head>
      <body className={`font-sans ${inter.variable}`}>
        <CopilotKit runtimeUrl="/api/copilotkit">
          <TRPCReactProvider>
            <Providers>
              <NavBar />
              {children}
              <InstallPWA />
              <ServiceWorkerRegistration />
            </Providers>
            <Toaster />
          </TRPCReactProvider>
        </CopilotKit>
        <Script
          src="https://www.bugherd.com/sidebarv2.js?apikey=kaslzeefnsidvbsdmhclcq"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
