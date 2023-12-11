import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Gone Picklin'",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <style
        dangerouslySetInnerHTML={{
          __html: `

        @import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap");
				`,
        }}
      />
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
