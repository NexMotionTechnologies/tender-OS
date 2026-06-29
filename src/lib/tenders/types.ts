export type TenderStatus =
  | "identified"
  | "shortlisted"
  | "preparing"
  | "submitted"
  | "won"
  | "lost";

export type Province = "Limpopo" | "Free State" | "Gauteng";

export interface ChecklistItem {
  id: string;
  item: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Requirement {
  text: string;
  fit: "expert" | "competent" | "gap";
  score: number;
}

export interface Tender {
  id: string;
  title: string;
  source: string;
  link: string;
  municipality: string;
  province: Province;
  category: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  datePosted: string;
  status: TenderStatus;
  fitScore: number;
  requirements: Requirement[];
  risks: string[];
  recommendation: string;
  checklist: ChecklistItem[];
  comments: Comment[];
  outcome?: { note: string };
}

export const STATUS_LABELS: Record<TenderStatus, string> = {
  identified: "Identified",
  shortlisted: "Shortlisted",
  preparing: "Preparing",
  submitted: "Submitted",
  won: "Won",
  lost: "Lost",
};

export const PIPELINE_COLUMNS: TenderStatus[] = [
  "identified",
  "shortlisted",
  "preparing",
  "submitted",
];
