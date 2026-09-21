import { supabase } from "./supabase";
import type {
  CandidateProfile,
  CurrentProfile,
  Health,
  IpRulePage,
  AuditPage,
  Resume,
  ResumePage,
} from "../types";

const base =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://127.0.0.1:8000/api/v1";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { data } = supabase
    ? await supabase.auth.getSession()
    : { data: { session: null } };
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (data.session?.access_token)
    headers.set("Authorization", `Bearer ${data.session.access_token}`);
  const response = await fetch(`${base}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      detail?: string;
      message?: string;
    } | null;
    throw new ApiError(
      response.status,
      body?.detail ?? body?.message ?? `Request failed (${response.status})`,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const endpoints = {
  me: () => api<CurrentProfile>("/auth/me"),
  health: () => api<Health>("/health"),
  readiness: () => api<Health>("/health/ready"),
  resumes: () => api<ResumePage>("/resumes"),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api<Resume>("/resumes", { method: "POST", body: form });
  },
  replace: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api<{ resume: Resume; replaced: true }>(`/resumes/${id}/replace`, {
      method: "POST",
      body: form,
    });
  },
  profile: (id: string) => api<CandidateProfile>(`/resumes/${id}/profile`),
  deleteResume: (id: string) =>
    api<void>(`/resumes/${id}`, { method: "DELETE" }),
  ipRules: () => api<IpRulePage>("/admin/security/ip-rules"),
  createRule: (payload: object) =>
    api("/admin/security/ip-rules", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateRule: (id: string, payload: object) =>
    api(`/admin/security/ip-rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteRule: (id: string) =>
    api<void>(`/admin/security/ip-rules/${id}`, { method: "DELETE" }),
  audit: () => api<AuditPage>("/admin/security/audit-events"),
};
