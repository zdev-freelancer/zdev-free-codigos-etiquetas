import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartPanel } from "@/components/cart/cart-panel";
import { WhatsAppBubble } from "@/components/layout/whatsapp-bubble";
import { socialLinks } from "@/config/site";
import {
  getCurrentTenant,
  tenantBrand,
  tenantSocialLinks,
  tenantThemeVars,
} from "@/lib/tenant";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getCurrentTenant();
  const brand = tenantBrand(tenant);

  let social = tenantSocialLinks(tenant);
  if (social.length === 0) {
    social = socialLinks.map((s) => ({ key: s.icon, href: s.href }));
  }

  // `display: contents` keeps the body's flex layout intact while letting the
  // tenant's theme custom properties (--tenant-accent*) cascade to children.
  return (
    <div style={tenantThemeVars(tenant.theme)} className="contents">
      <AnnouncementBar />
      <Navbar brand={brand} />
      <main className="flex-1">{children}</main>
      <Footer brand={brand} social={social} />
      <CartPanel />
      <WhatsAppBubble phone={tenant.whatsapp} />
    </div>
  );
}
