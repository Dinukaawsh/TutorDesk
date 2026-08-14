import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WhatsAppButtonProps = {
  teacherName: string;
  whatsapp?: string | null;
  className?: string;
};

function normalizeWhatsAppNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function WhatsAppButton({
  teacherName,
  whatsapp,
  className,
}: WhatsAppButtonProps) {
  if (!whatsapp) {
    return null;
  }

  const href = `https://wa.me/${normalizeWhatsAppNumber(whatsapp)}`;

  return (
    <Button asChild variant="outline" className={cn("w-full", className)}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4" />
        Message {teacherName} on WhatsApp
      </a>
    </Button>
  );
}