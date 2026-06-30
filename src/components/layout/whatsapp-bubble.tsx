import { WhatsAppIcon } from "@/components/ui/icons";

/** Floating WhatsApp button (storefront). No-op if no number is configured. */
export function WhatsAppBubble({ href }: { href: string | null | undefined }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
