const fs = require("fs");
const p = "C:/Users/Asus/Desktop/LMS/tutordesk/app/(teacher)/teacher/students/page.tsx";
let c = fs.readFileSync(p, "utf8");
if (!c.match(/phone: s\.phone,\n    whatsapp:/)) {
  c = c.replace(
    "    phone: s.phone,\n    grade: s.grade,\n    isDisabled:",
    "    phone: s.phone,\n    whatsapp: s.whatsapp,\n    grade: s.grade,\n    isDisabled:",
  );
  fs.writeFileSync(p, c);
  console.log("added whatsapp to row");
}
