export type Role = "owner" | "admin" | "editor" | "member" | "guest";

export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type PlanScope = "day" | "week" | "month" | null;
export type BonusType = "money" | "gift" | "points" | "text";
export type BonusStatus = "pending" | "awarded";
export type FileScope = "workspace" | "project" | "task";
export type ShareMode = "view" | "comment";
export type NotificationChannel = "email" | "whatsapp" | "inapp";
export type ProjectStatus = "active" | "on_hold" | "completed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_whatsapp: string | null;
  position: string | null;
  skills: string[];
  role: Role;
  locale: "kk" | "ru";
  is_blocked: boolean;
  notification_channels: NotificationChannel[];
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  goal: string | null;
  deadline: string | null;
  status: ProjectStatus;
  created_by: string;
  archived_at: string | null;
  created_at: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role_in_project: Role;
  profile?: Profile;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  audio_url: string | null;
  transcript: string | null;
  assignee_id: string | null;
  helpers: string[];
  status: TaskStatus;
  priority: TaskPriority;
  color: string | null;
  plan_scope: PlanScope;
  due_at: string | null;
  bonus_type: BonusType | null;
  bonus_value: string | null;
  checklist: ChecklistItem[];
  tags: string[];
  created_by: string;
  position: number;
  deleted_at: string | null;
  created_at: string;
}

export interface TaskChainStep {
  id: string;
  task_id: string;
  step_order: number;
  user_id: string;
  description: string | null;
  step_deadline: string | null;
  status: "pending" | "active" | "done" | "returned";
  handed_at: string | null;
  returned_reason: string | null;
  profile?: Profile;
}

export interface TaskEvent {
  id: string;
  task_id: string;
  user_id: string;
  event_type:
    | "status_change"
    | "return"
    | "comment"
    | "assign"
    | "chain_advance"
    | "attachment";
  payload: Record<string, unknown>;
  created_at: string;
  profile?: Profile;
}

export interface Meeting {
  id: string;
  project_id: string;
  title: string;
  date: string;
  secretary_id: string | null;
  agenda: string | null;
  decisions: MeetingDecision[];
  participants: string[];
  created_by: string;
  created_at: string;
}

export interface MeetingDecision {
  id: string;
  text: string;
  assignee_id: string | null;
  due_at: string | null;
  task_id: string | null;
}

export interface FileRecord {
  id: string;
  scope: FileScope;
  scope_id: string | null;
  owner_id: string;
  name: string;
  storage_path: string;
  mime: string | null;
  size: number;
  is_contract: boolean;
  created_at: string;
}

export interface FilePermission {
  file_id: string;
  user_id: string;
  can_view: boolean;
  can_download: boolean;
  granted_by: string;
}

export interface ShareLink {
  id: string;
  resource_type: "task" | "project" | "meeting";
  resource_id: string;
  token: string;
  mode: ShareMode;
  expires_at: string | null;
  password_hash: string | null;
  created_by: string;
  revoked: boolean;
  created_at: string;
  open_count?: number;
}

export interface Bonus {
  id: string;
  task_id: string;
  user_id: string;
  type: BonusType;
  value: string;
  status: BonusStatus;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  created_at: string;
  profile?: Profile;
}

export const TASK_STATUSES: TaskStatus[] = [
  "todo",
  "in_progress",
  "in_review",
  "done",
];

export const TASK_PRIORITIES: TaskPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

export const ROLE_ORDER: Role[] = ["owner", "admin", "editor", "member", "guest"];
