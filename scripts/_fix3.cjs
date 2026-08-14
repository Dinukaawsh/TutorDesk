const fs = require("fs");
const p = "C:/Users/Asus/Desktop/LMS/tutordesk/components/inquiries/inquiry-form.tsx";
let c = fs.readFileSync(p, "utf8");
c = c.replace(
  `{inquiry?.attachmentUrls.map((url) => (
        <input key={url} type="hidden" name="keepAttachmentUrls" value={url} />
      ))}}`,
  `{inquiry?.attachmentUrls.map((url) => (
        <input key={url} type="hidden" name="keepAttachmentUrls" value={url} />
      ))}`,
);
fs.writeFileSync(p, c);
