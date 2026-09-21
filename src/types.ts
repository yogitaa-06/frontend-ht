export type Role = "employee" | "admin";
export type ResumeStatus =
  "uploaded" | "parsing" | "parsed" | "parse_failed" | "deleted";
export interface CurrentProfile {
  id: string;
  auth_user_id: string;
  email: string;
  role: Role;
  is_active: boolean;
}
export interface Resume {
  id: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  status: ResumeStatus;
  parser_version: string | null;
  parse_error_code: string | null;
  created_at: string;
  updated_at: string;
}
export interface ResumePage {
  items: Resume[];
  total: number;
  offset: number;
  limit: number;
}
export interface EmploymentEntry {
  company: string | null;
  title: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}
export interface EducationEntry {
  institution: string | null;
  qualification: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
}
export interface CandidateProfile {
  id: string;
  resume_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  professional_summary: string | null;
  years_of_experience: number | string | null;
  skills: string[];
  employment_history: EmploymentEntry[];
  education: EducationEntry[];
  certifications: string[];
  languages: string[];
  created_at: string;
  updated_at: string;
}
export interface IpRule {
  id: string;
  cidr: string;
  label: string;
  description: string | null;
  enabled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
export interface IpRulePage {
  items: IpRule[];
  total: number;
  offset: number;
  limit: number;
}
export interface AuditEvent {
  id: string;
  actor_user_id: string | null;
  event_type: string;
  request_ip: string | null;
  user_agent: string | null;
  resource_type: string | null;
  resource_id: string | null;
  created_at: string;
}
export interface AuditPage {
  items: AuditEvent[];
  total: number;
  offset: number;
  limit: number;
}
export interface Health {
  status: "ok";
  service: string;
  version: string;
}
