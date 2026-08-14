"use client";

import Link from "next/link";
import { FiMessageCircle, FiPhone } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { getWhatsAppLink } from "@/lib/utils";

type StudentContactSectionProps = {
  phone?: string | null;
  whatsapp?: string | null;
};

export function StudentContactSection({ phone, whatsapp }: StudentContactSectionProps) {
  const waNumber = whatsapp?.trim() || phone?.trim();
  if (!phone?.trim() && !waNumber) {
    return null;
  }

  return (
    <div className="space-y-2 border-t border-border pt-4">
      <p className="text-sm font-medium text-foreground">Contact</p>
      {phone?.trim() ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FiPhone className="h-4 w-4 shrink-0" aria-hidden />
          <a href={`tel:${phone.trim()}`} className="hover:text-foreground">
            {phone.trim()}
          </a>
        </div>
      ) : null}
      {waNumber ? (
        <Button asChild variant="outline" size="sm" className="rounded-[4px]">
          <Link href={getWhatsAppLink(waNumber)} target="_blank" rel="noopener noreferrer">
            <FiMessageCircle className="h-4 w-4" />
            WhatsApp
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
