import "~/styles/globals.css";
import Script from 'next/script';
import NavBar from "./_components/shared/navBar"; // Fix the casing of the file name
import { CopilotKit } from "@copilotkit/react-core"; 
import "@copilotkit/react-ui/styles.css";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { Providers } from "./providers";

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
      <body className={`font-sans ${inter.variable}`}>
        <CopilotKit runtimeUrl="/api/copilotkit">
          <TRPCReactProvider>
            <Providers>
              <NavBar />
              {children}
            </Providers>
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
