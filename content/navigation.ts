export const labels = {
  "nav.dashboard": "Dashboard",
  "nav.students": "Students",
  "nav.subjects": "Subjects",
  "nav.lessons": "Lessons",
  "nav.assignments": "Assignments",
  "nav.fees": "Fees",
  "nav.notifications": "Notifications",
  "nav.settings": "Settings",
  "table.paymentStatus": "Payment status",
  "table.accountStatus": "Account",
  "fee.status.unpaid": "Unpaid",
  "fee.status.pending": "In Review",
  "fee.status.paid": "Paid",
  "fee.allPaid": "All paid",
  "fee.pending": "Pending review",
  "fee.unpaid": "Unpaid",
  "fee.mixed": "Mixed",
  "fee.none": "No fees",
  "fee.monthlyAmount": "Monthly fee",
  "account.active": "Active",
  "account.disabled": "Disabled",
} as const;

export type LabelKey = keyof typeof labels;
export type NavigationLabelKey = LabelKey;

export function t(key: LabelKey): string {
  return labels[key] ?? key;
}

export type NavItem = {
  href: string;
  labelKey: LabelKey;
};

export const teacherNavItems: NavItem[] = [
  { href: "/teacher/dashboard", labelKey: "nav.dashboard" },
  { href: "/teacher/students", labelKey: "nav.students" },
  { href: "/teacher/subjects", labelKey: "nav.subjects" },
  { href: "/teacher/lessons", labelKey: "nav.lessons" },
  { href: "/teacher/assignments", labelKey: "nav.assignments" },
  { href: "/teacher/fees", labelKey: "nav.fees" },
  { href: "/teacher/notifications", labelKey: "nav.notifications" },
  { href: "/teacher/settings", labelKey: "nav.settings" },
];

export const studentNavItems: NavItem[] = [
  { href: "/student/dashboard", labelKey: "nav.dashboard" },
  { href: "/student/lessons", labelKey: "nav.lessons" },
  { href: "/student/assignments", labelKey: "nav.assignments" },
  { href: "/student/fees", labelKey: "nav.fees" },
  { href: "/student/notifications", labelKey: "nav.notifications" },
];

export function formatSubjectMonthlyFee(
  monthlyFee: number | null | undefined,
  currency = "LKR",
): string | null {
  if (monthlyFee == null || Number.isNaN(monthlyFee)) {
    return null;
  }
  return `${currency} ${monthlyFee.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}