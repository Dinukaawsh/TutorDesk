const fs = require("fs");
const p = "C:/Users/Asus/Desktop/LMS/tutordesk/components/fees/fee-review-table.tsx";
let c = fs.readFileSync(p, "utf8");
if (!c.includes("BottomActionBar")) {
  c = c.replace(
    'import { Button } from "@/components/ui/button";',
    'import { BottomActionBar } from "@/components/ui/bottom-action-bar";\nimport { Button } from "@/components/ui/button";',
  );
  c = c.replace(
    `        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="rounded-[4px]"
            disabled={selectedPendingIds.length === 0}
            onClick={() => setBulkMode("approve")}
          >
            {t("action.bulkApprove")} ({selectedPendingIds.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-[4px]"
            disabled={selectedPendingIds.length === 0}
            onClick={() => setBulkMode("reject")}
          >
            {t("action.bulkReject")} ({selectedPendingIds.length})
          </Button>
        </div>`,
    "",
  );
  c = c.replace(
    "      <ConfirmModal\n        open={bulkMode !== null}",
    `      <BottomActionBar open={selectedPendingIds.length > 0}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">{selectedPendingIds.length} fee record(s) selected</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="rounded-[4px]"
              onClick={() => setBulkMode("approve")}
            >
              {t("action.bulkApprove")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-[4px]"
              onClick={() => setBulkMode("reject")}
            >
              {t("action.bulkReject")}
            </Button>
          </div>
        </div>
      </BottomActionBar>

      <ConfirmModal
        open={bulkMode !== null}`,
  );
  fs.writeFileSync(p, c);
  console.log("patched fee-review-table");
}
