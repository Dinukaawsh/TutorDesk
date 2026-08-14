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
  "dashboard.teacher.title": "Teacher dashboard",
  "dashboard.teacher.description": "Overview of your classes, fees, and recent activity",
  "dashboard.student.title": "Student dashboard",
  "dashboard.student.welcome": "Welcome back",
  "dashboard.student.description": "Your lessons, assignments, and fees at a glance",
  "dashboard.filter.subject": "Subject",
  "dashboard.filter.grade": "Grade",
  "dashboard.filter.month": "Month",
  "dashboard.filter.year": "Year",
  "dashboard.filter.allSubjects": "All subjects",
  "dashboard.filter.allGrades": "All grades",
  "dashboard.filter.reset": "Reset filters",
  "dashboard.stat.totalStudents": "Total students",
  "dashboard.stat.pendingFeeReviews": "Pending fee reviews",
  "dashboard.stat.unpaidFees": "Unpaid fees",
  "dashboard.stat.assignmentsDueWeek": "Assignments due this week",
  "dashboard.stat.enrolledSubjects": "Enrolled subjects",
  "dashboard.stat.pendingAssignments": "Pending assignments",
  "dashboard.stat.dueThreeDays": "Due within 3 days",
  "dashboard.stat.recentSubmissions": "Recent submissions",
  "dashboard.section.studentOverview": "Student overview",
  "dashboard.section.recentActivity": "Recent activity",
  "dashboard.section.homeworkSubmissions": "Homework submissions",
  "dashboard.section.feeProofSubmissions": "Fee proof submissions",
  "dashboard.section.mySubjects": "My subjects",
  "dashboard.section.pendingAssignments": "Pending assignments",
  "dashboard.section.closingDeadlines": "Deadlines closing soon",
  "dashboard.section.recentSubmissionsList": "Recent submissions",
  "dashboard.table.student": "Student",
  "dashboard.table.grade": "Grade",
  "dashboard.table.subjects": "Subjects",
  "dashboard.table.actions": "Actions",
  "dashboard.table.empty": "No students match your filters.",
  "dashboard.table.assignment": "Assignment",
  "dashboard.table.deadline": "Deadline",
  "dashboard.table.status": "Status",
  "dashboard.table.marks": "Marks",
  "dashboard.table.date": "Date",
  "dashboard.action.view": "View student",
  "dashboard.action.edit": "Edit student",
  "dashboard.action.disable": "Disable student",
  "dashboard.action.openProfile": "Open full profile",
  "dashboard.action.submit": "Submit",
  "dashboard.empty.pendingAssignments": "You are caught up - no pending assignments.",
  "dashboard.empty.closingDeadlines": "No deadlines in the next 3 days.",
  "dashboard.empty.recentSubmissions": "No submissions yet.",
  "dashboard.empty.recentActivity": "No recent activity.",
  "modal.viewStudent.title": "Student details",
  "modal.disableStudent.title": "Disable student",
  "modal.enableStudent.title": "Enable student",
  "modal.enableStudent.description": "They will regain access to their account.",
  "modal.deleteSubject.title": "Delete subject",
  "modal.deleteSubject.description": "This cannot be undone. Enrollments and related content may be affected.",
  "modal.approveFee.title": "Approve fee proof",
  "modal.rejectFee.title": "Reject fee proof",
  "modal.markPaid.title": "Mark fee as paid",
  "modal.bulkApprove.title": "Approve selected fees",
  "modal.bulkReject.title": "Reject selected fees",
  "modal.signOut.title": "Sign out?",
  "modal.signOut.description": "You will need to sign in again to continue.",
  "action.edit": "Edit",
  "action.delete": "Delete",
  "action.view": "View",
  "action.disable": "Disable",
  "action.enable": "Enable",
  "action.approve": "Approve",
  "action.reject": "Reject",
  "action.logout": "Log out",
  "action.signOut": "Sign out",
  "action.add": "Add",
  "action.save": "Save",
  "action.submit": "Submit",
  "action.addStudent": "Add student",
  "action.addSubject": "Add subject",
  "action.resetPassword": "Reset password",
  "action.markPaid": "Mark as paid",
  "action.viewProof": "View proof",
  "action.bulkApprove": "Bulk approve",
  "action.bulkReject": "Bulk reject",
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