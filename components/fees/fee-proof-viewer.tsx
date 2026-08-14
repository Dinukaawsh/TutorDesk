"use client";

type FeeProofViewerProps = {
  proofUrl: string | null | undefined;
  title?: string;
};

export function FeeProofViewer({ proofUrl, title = "Payment proof" }: FeeProofViewerProps) {
  if (!proofUrl) {
    return <p className="text-sm text-muted-foreground">No proof uploaded.</p>;
  }

  const isPdf = proofUrl.toLowerCase().includes(".pdf");

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {isPdf ? (
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline"
        >
          Open PDF proof
        </a>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proofUrl}
          alt="Fee payment proof"
          className="max-h-64 w-full rounded-lg border border-border object-contain bg-white"
        />
      )}
    </div>
  );
}
