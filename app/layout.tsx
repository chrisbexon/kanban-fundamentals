import "./globals.css";

// Root layout is minimal — locale layout handles html/body/providers
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
