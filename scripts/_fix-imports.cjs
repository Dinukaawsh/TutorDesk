const fs = require("fs");
const p = "C:/Users/Asus/Desktop/LMS/tutordesk/components/inquiries/teacher-inquiry-list.tsx";
let c = fs.readFileSync(p, "utf8");
c = c.replace('import { FormModal } from "@/components/modals/form-modal";\n', "");
fs.writeFileSync(p, c);

const enumsPath = "C:/Users/Asus/Desktop/LMS/tutordesk/types/enums.ts";
let e = fs.readFileSync(enumsPath, "utf8");
if (!e.includes("AnnouncementTarget")) {
  e = e.replace(
    "export {",
    "export {\n  AnnouncementTarget,\n  InquiryStatus,",
  );
  fs.writeFileSync(enumsPath, e);
}
console.log("fixed imports");
