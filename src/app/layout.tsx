import "~/styles/globals.css";
import { useEffect } from "react";
import NavBar from "./_components/navBar"; // Fix the casing of the file name
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
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.bugherd.com/sidebarv2.js?apikey=kaslzeefnsidvbsdmhclcq";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
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
      </body>
    </html>
  );
}
