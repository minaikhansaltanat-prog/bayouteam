import { setRequestLocale, getTranslations } from "next-intl/server";
import { FolderKanban, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/actions/auth";
import { getMyTasks, getQuickStats } from "@/lib/data/dashboard";
import { TaskCard } from "@/components/tasks/task-card";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, profile] = await Promise.all([
    getTranslations("dashboard"),
    getCurrentProfile(),
  ]);

  if (!profile) return null;

  const [tasks, stats] = await Promise.all([
    getMyTasks(profile.id),
    getQuickStats(profile.id),
  ]);

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);

  const overdue = tasks.filter((task) => task.due_at && new Date(task.due_at).getTime() < now);
  const dueToday = tasks.filter(
    (task) =>
      task.due_at &&
      new Date(task.due_at) >= startOfToday &&
      new Date(task.due_at) <= endOfToday,
  );
  const upcoming = tasks.filter(
    (task) => task.due_at && new Date(task.due_at).getTime() > endOfToday.getTime(),
  );
  const noDeadline = tasks.filter((task) => !task.due_at);

  const firstName = profile.full_name?.split(" ")[0] ?? profile.email;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {t("greeting", { name: firstName })}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {t("todayQuestion")}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label={t("activeProjects")}
          value={stats.activeProjects}
        />
        <StatCard
          icon={CheckCircle2}
          label={t("completedThisWeek")}
          value={stats.completedThisWeek}
        />
        <StatCard label={t("overdue")} value={overdue.length} tone="danger" />
        <StatCard label={t("dueToday")} value={dueToday.length} tone="warning" />
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <CheckCircle2 className="h-10 w-10 text-success" strokeWidth={1.5} />
            <p className="text-base font-medium text-foreground">{t("noTasks")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          <TaskGroup title={t("overdue")} tasks={overdue} tone="danger" />
          <TaskGroup title={t("dueToday")} tasks={dueToday} tone="warning" />
          <TaskGroup title={t("upcoming")} tasks={upcoming} />
          <TaskGroup title={t("myTasks")} tasks={noDeadline} />
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
  tone?: "danger" | "warning";
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 p-4 sm:p-5">
        {Icon && <Icon className="h-5 w-5 text-navy-500" strokeWidth={1.75} />}
        <span
          className={
            tone === "danger"
              ? "font-display text-2xl font-semibold text-danger"
              : tone === "warning"
                ? "font-display text-2xl font-semibold text-warning"
                : "font-display text-2xl font-semibold text-foreground"
          }
        >
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function TaskGroup({
  title,
  tasks,
  tone,
}: {
  title: string;
  tasks: Awaited<ReturnType<typeof getMyTasks>>;
  tone?: "danger" | "warning";
}) {
  if (tasks.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2
        className={
          tone === "danger"
            ? "text-sm font-semibold uppercase tracking-wide text-danger"
            : tone === "warning"
              ? "text-sm font-semibold uppercase tracking-wide text-warning"
              : "text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        }
      >
        {title} ({tasks.length})
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <Link key={task.id} href={`/projects/${task.project_id}`}>
            <TaskCard task={task} showProject />
          </Link>
        ))}
      </div>
    </section>
  );
}
