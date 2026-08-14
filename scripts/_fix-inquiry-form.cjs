const fs = require("fs");
const p = "C:/Users/Asus/Desktop/LMS/tutordesk/components/inquiries/inquiry-form.tsx";
let c = fs.readFileSync(p, "utf8");
c = c.replace("      )) : null\n      <div className=\"space-y-2\">", "      ))}\n      <div className=\"space-y-2\">");
fs.writeFileSync(p, c);
