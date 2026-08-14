const fs = require("fs");
const path = require("path");
const root = "C:/Users/Asus/Desktop/LMS/tutordesk";

function write(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("wrote", rel);
}

let schema = fs.readFileSync(path.join(root, "prisma/schema.prisma"), "utf8");
if (!schema.includes("AnnouncementTarget")) {
  schema = schema.replace(
    "enum NotificationType {",
    `enum AnnouncementTarget {
  EVERYONE
  SUBJECT
  GRADE
  SUBJECT_GRADE
}

enum InquiryStatus {
  OPEN
  REVIEWED
  CLOSED
}

enum NotificationType {`,
  );
  schema = schema.replace(
    "  DEADLINE_REMINDER\n}",
    `  DEADLINE_REMINDER
  ANNOUNCEMENT_PUBLISHED
  INQUIRY_SUBMITTED
  INQUIRY_UPDATED
  INQUIRY_STATUS_CHANGED
}`,
  );
  schema = schema.replace(
    '  individualAssignments Assignment[] @relation("IndividualStudent")\n}',
    `  individualAssignments Assignment[] @relation("IndividualStudent")
  inquiries             Inquiry[]
}`,
  );
  schema = schema.replace(
    "  feeRecords  FeeRecord[]\n}",
    `  feeRecords     FeeRecord[]
  announcements  Announcement[]
}`,
  );
  schema += `

model Announcement {
  id         String             @id @default(cuid())
  title      String
  body       String
  targetType AnnouncementTarget
  subjectId  String?
  grade      String?
  createdAt  DateTime           @default(now())
  subject    Subject?           @relation(fields: [subjectId], references: [id], onDelete: SetNull)
}

model Inquiry {
  id             String        @id @default(cuid())
  studentId      String
  title          String
  body           String
  status         InquiryStatus @default(OPEN)
  attachmentUrls String[]
  teacherNote    String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  student        User          @relation(fields: [studentId], references: [id], onDelete: Cascade)
  edits          InquiryEdit[]
}

model InquiryEdit {
  id                String   @id @default(cuid())
  inquiryId         String
  titleBefore       String
  bodyBefore        String
  attachmentsBefore String[]
  editedAt          DateTime @default(now())
  inquiry           Inquiry  @relation(fields: [inquiryId], references: [id], onDelete: Cascade)
}
`;
  fs.writeFileSync(path.join(root, "prisma/schema.prisma"), schema);
}

let utils = fs.readFileSync(path.join(root, "lib/utils.ts"), "utf8");
if (!utils.includes("getWhatsAppLink")) {
  utils += `

export function getWhatsAppLink(phoneOrWhatsapp: string): string {
  const digits = phoneOrWhatsapp.replace(/\\D/g, "");
  return \`https://wa.me/\${digits}\`;
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(typeof date === "string" ? new Date(date) : date);
}
`;
  fs.writeFileSync(path.join(root, "lib/utils.ts"), utils);
}

let uploads = fs.readFileSync(path.join(root, "lib/uploads.ts"), "utf8");
if (!uploads.includes("saveInquiryAttachments")) {
  uploads += `

export async function saveInquiryAttachments(files: File[]) {
  const urls: string[] = [];
  for (const file of files) {
    const url = await saveUploadedFile(file, {
      subfolder: "inquiries",
      allowedMimeTypes: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ],
      maxBytes: MAX_IMAGE_BYTES,
    });
    urls.push(url);
  }
  return urls;
}
`;
  fs.writeFileSync(path.join(root, "lib/uploads.ts"), uploads);
}

console.log("done");
