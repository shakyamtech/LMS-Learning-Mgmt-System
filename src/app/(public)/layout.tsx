import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--college-bg-cream)" }}>
      <SiteHeader />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
