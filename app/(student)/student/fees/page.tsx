import { getStudentFees } from "@/actions/fee.actions";
import { StudentFeeList } from "@/components/fees/student-fee-list";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentMonthYear } from "@/lib/fees";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default async function StudentFeesPage() {
  const records = await getStudentFees();
  const { month, year } = getCurrentMonthYear();
  const monthLabel = `${MONTHS[month - 1] ?? month} ${year}`;

  return (
    <>
      <PageHeader
        title="Fees"
        description="Submit payment proof for each enrolled subject"
      />
      <StudentFeeList records={records} monthLabel={monthLabel} />
    </>
  );
}
