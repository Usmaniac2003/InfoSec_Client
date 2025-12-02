import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import { CryptoProvider } from "@/context/CryptoContext";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body >
        <AuthProvider>
          <CryptoProvider>
        {children}
        </CryptoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
