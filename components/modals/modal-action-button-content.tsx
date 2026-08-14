import { Spinner } from "@/components/ui/spinner";

type ModalActionButtonContentProps = {
  pending: boolean;
  label: string;
  pendingLabel?: string;
};

export function ModalActionButtonContent({
  pending,
  label,
  pendingLabel,
}: ModalActionButtonContentProps) {
  if (!pending) {
    return label;
  }

  return (
    <>
      <Spinner size="sm" className="shrink-0" />
      {pendingLabel ?? label}
    </>
  );
}
