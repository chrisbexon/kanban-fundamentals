import { Shell } from "@/components/ui/shell";
import { Footer } from "@/components/ui/footer";
import { ChatWidget } from "@/components/ui/chat-widget";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Shell>
      {children}
      <Footer />
      <ChatWidget />
    </Shell>
  );
}
