const fs = require("fs");
const p = "C:/Users/Asus/Desktop/LMS/tutordesk/components/inquiries/inquiry-form.tsx";
let c = fs.readFileSync(p, "utf8");
c = c.replace("      )) : null", "      ))}");
fs.writeFileSync(p, c);
console.log(c.includes(")) : null") ? "still broken" : "fixed");
