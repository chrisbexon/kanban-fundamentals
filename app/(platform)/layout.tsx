import { Shell } from "@/components/ui/shell";
import { Footer } from "@/components/ui/footer";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Shell>
      {children}
      <Footer />
    </Shell>
  );
}
