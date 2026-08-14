import { getNotificationsAction, markAllReadFormAction } from "@/actions/notification.actions";
import { NotificationList } from "@/components/notifications/notification-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default async function TeacherNotificationsPage() {
  const notifications = await getNotificationsAction(50);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Updates about homework, fees, and students"
        actions={
          <form action={markAllReadFormAction}>
            <Button type="submit" variant="outline" size="sm">
              Mark all read
            </Button>
          </form>
        }
      />
      <div className="rounded-xl border border-border bg-white/80 p-2 backdrop-blur">
        <NotificationList notifications={notifications} />
      </div>
    </>
  );
}

