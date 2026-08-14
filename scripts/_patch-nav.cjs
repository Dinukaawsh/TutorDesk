const fs = require("fs");
const p = "C:/Users/Asus/Desktop/LMS/tutordesk/content/navigation.ts";
let c = fs.readFileSync(p, "utf8");
if (!c.includes('"nav.announcements"')) {
  c = c.replace(
    '"nav.notifications": "Notifications",',
    '"nav.notifications": "Notifications",\n  "nav.announcements": "Announcements",\n  "nav.inquiries": "Inquiries",',
  );
  c = c.replace(
    '{ href: "/teacher/fees", labelKey: "nav.fees" },',
    '{ href: "/teacher/fees", labelKey: "nav.fees" },\n  { href: "/teacher/announcements", labelKey: "nav.announcements" },\n  { href: "/teacher/inquiries", labelKey: "nav.inquiries" },',
  );
  c = c.replace(
    '{ href: "/student/fees", labelKey: "nav.fees" },',
    '{ href: "/student/fees", labelKey: "nav.fees" },\n  { href: "/student/announcements", labelKey: "nav.announcements" },\n  { href: "/student/inquiries", labelKey: "nav.inquiries" },',
  );
  fs.writeFileSync(p, c);
  console.log("navigation updated");
}
