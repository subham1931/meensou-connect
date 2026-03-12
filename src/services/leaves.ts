import { assertSupabaseConfigured, supabase } from "../lib/supabase"

export type LeaveRequestStatus = "Pending" | "Approved" | "Rejected" | "Canceled"

export type EmployeeLeaveRequest = {
  id: string
  employeeCode: string
  leaveTitle: string
  leaveType: string
  startDate: string
  endDate: string
  isHalfDay: boolean
  reason: string
  attachmentUrl: string
  status: LeaveRequestStatus
  reviewNote: string
  reviewedAt: string | null
  createdAt: string | null
}

type CreateLeavePayload = {
  employeeCode: string
  leaveTitle: string
  leaveType: string
  startDate: string
  endDate: string
  isHalfDay?: boolean
  reason?: string
  attachmentUrl?: string
}

function getClient() {
  assertSupabaseConfigured()
  return supabase!
}

function mapRow(row: any): EmployeeLeaveRequest {
  return {
    id: row.id || "",
    employeeCode: row.employee_code || "",
    leaveTitle: row.leave_title || "",
    leaveType: row.leave_type || "Casual Leave",
    startDate: row.start_date || "",
    endDate: row.end_date || "",
    isHalfDay: Boolean(row.is_half_day),
    reason: row.reason || "",
    attachmentUrl: row.attachment_url || "",
    status: (row.status || "Pending") as LeaveRequestStatus,
    reviewNote: row.review_note || "",
    reviewedAt: row.reviewed_at || null,
    createdAt: row.created_at || null,
  }
}

export async function listEmployeeLeaveRequests(employeeCode: string) {
  const client = getClient()
  const code = String(employeeCode || "").trim()
  if (!code) return []

  const { data, error } = await client
    .from("leave_requests")
    .select(`
      id,
      employee_code,
      leave_title,
      leave_type,
      start_date,
      end_date,
      is_half_day,
      reason,
      attachment_url,
      status,
      review_note,
      reviewed_at,
      created_at
    `)
    .eq("employee_code", code)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message || "Unable to load leave requests.")
  return (data || []).map(mapRow)
}

export async function createLeaveRequest(payload: CreateLeavePayload) {
  const client = getClient()
  const employeeCode = String(payload.employeeCode || "").trim()
  const leaveTitle = String(payload.leaveTitle || "").trim()
  const leaveType = String(payload.leaveType || "").trim() || "Casual Leave"
  const startDate = String(payload.startDate || "").trim()
  const endDate = String(payload.endDate || "").trim()
  if (!employeeCode) throw new Error("Missing employee code.")
  if (!startDate || !endDate) throw new Error("Start date and end date are required.")
  if (!leaveTitle) throw new Error("Leave title is required.")

  const { data, error } = await client
    .from("leave_requests")
    .insert({
      employee_code: employeeCode,
      leave_title: leaveTitle,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      is_half_day: Boolean(payload.isHalfDay),
      reason: payload.reason || "",
      attachment_url: payload.attachmentUrl || "",
      status: "Pending",
      source: "mobile-app",
    })
    .select(`
      id,
      employee_code,
      leave_title,
      leave_type,
      start_date,
      end_date,
      is_half_day,
      reason,
      attachment_url,
      status,
      review_note,
      reviewed_at,
      created_at
    `)
    .single()

  if (error) throw new Error(error.message || "Unable to apply leave.")
  return mapRow(data)
}

export async function cancelPendingLeaveRequest(leaveRequestId: string) {
  const client = getClient()
  const id = String(leaveRequestId || "").trim()
  if (!id) throw new Error("Missing leave request ID.")

  const { data, error } = await client
    .from("leave_requests")
    .update({ status: "Canceled" })
    .eq("id", id)
    .eq("status", "Pending")
    .select(`
      id,
      employee_code,
      leave_title,
      leave_type,
      start_date,
      end_date,
      is_half_day,
      reason,
      attachment_url,
      status,
      review_note,
      reviewed_at,
      created_at
    `)
    .maybeSingle()

  if (error) throw new Error(error.message || "Unable to cancel leave request.")
  if (!data) throw new Error("Only pending leave requests can be canceled.")
  return mapRow(data)
}
