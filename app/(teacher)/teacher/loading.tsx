import { Spinner } from "@/components/ui/spinner";

export default function TeacherLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
