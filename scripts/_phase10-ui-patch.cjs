const fs = require("fs");
const root = "C:/Users/Asus/Desktop/LMS/tutordesk";

function patch(rel, fn) {
  const p = root + "/" + rel;
  let c = fs.readFileSync(p, "utf8");
  const next = fn(c);
  if (next !== c) {
    fs.writeFileSync(p, next);
    console.log("patched", rel);
  }
}

patch("components/students/student-table.tsx", (c) => {
  if (c.includes("StudentContactSection")) return c;
  c = c.replace(
    'import { ViewModal } from "@/components/modals/view-modal";',
    'import { ViewModal } from "@/components/modals/view-modal";\nimport { StudentContactSection } from "@/components/students/student-contact-section";',
  );
  c = c.replace(
    "  phone: string | null;\n  grade: string | null;",
    "  phone: string | null;\n  whatsapp: string | null;\n  grade: string | null;",
  );
  c = c.replace(
    `            <div>
              <dt className="font-medium text-foreground">{t("table.accountStatus")}</dt>`,
    `            <StudentContactSection phone={viewStudent.phone} whatsapp={viewStudent.whatsapp} />
            <div>
              <dt className="font-medium text-foreground">{t("table.accountStatus")}</dt>`,
  );
  return c;
});

patch("app/(teacher)/teacher/students/page.tsx", (c) => {
  if (c.includes("whatsapp: s.whatsapp")) return c;
  return c.replace(
    "    phone: s.phone,\n    grade: s.grade,",
    "    phone: s.phone,\n    whatsapp: s.whatsapp,\n    grade: s.grade,",
  );
});

patch("components/dashboard/teacher-student-overview-table.tsx", (c) => {
  if (c.includes("StudentContactSection")) return c;
  c = c.replace(
    'import { ViewModal } from "@/components/modals/view-modal";',
    'import { ViewModal } from "@/components/modals/view-modal";\nimport { StudentContactSection } from "@/components/students/student-contact-section";',
  );
  c = c.replace(
    `            <div>
              <dt className="font-medium text-foreground">{t("table.accountStatus")}</dt>`,
    `            <StudentContactSection
              phone={viewStudent.form.phone}
              whatsapp={viewStudent.form.whatsapp}
            />
            <div>
              <dt className="font-medium text-foreground">{t("table.accountStatus")}</dt>`,
  );
  return c;
});
