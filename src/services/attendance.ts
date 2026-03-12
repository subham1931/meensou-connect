import { assertSupabaseConfigured, supabase } from "../lib/supabase"

type AttendanceRecord = {
  employeeCode: string
  attendanceDate: string
  checkInAt: string | null
  checkOutAt: string | null
  status: string
  workMinutes: number
  overtimeMinutes: number
}

function getClient() {
  assertSupabaseConfigured()
  return supabase!
}

function toYMD(dateObj = new Date()) {
  const y = dateObj.getFullYear()
  const m = `${dateObj.getMonth() + 1}`.padStart(2, "0")
  const d = `${dateObj.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

function toMinutes(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.getHours() * 60 + d.getMinutes()
}

function mapRow(row: any): AttendanceRecord {
  return {
    employeeCode: row.employee_code || "",
    attendanceDate: row.attendance_date || toYMD(),
    checkInAt: row.check_in_at || null,
    checkOutAt: row.check_out_at || null,
    status: row.status || "Not Marked",
    workMinutes: Number(row.work_minutes || 0),
    overtimeMinutes: Number(row.overtime_minutes || 0),
  }
}

export function formatTimeLabel(iso: string | null) {
  if (!iso) return "--"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "--"
  return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).format(date)
}

export async function getTodayAttendance(employeeCode: string) {
  return getAttendanceByDate(employeeCode, toYMD())
}

export async function getAttendanceByDate(employeeCode: string, attendanceDate: string) {
  const client = getClient()
  const code = String(employeeCode || "").trim()
  const date = String(attendanceDate || "").trim()
  if (!code) return null
  if (!date) return null

  const { data, error } = await client
    .from("attendance_records")
    .select("employee_code, attendance_date, check_in_at, check_out_at, status, work_minutes, overtime_minutes")
    .eq("employee_code", code)
    .eq("attendance_date", date)
    .maybeSingle()

  if (error) throw new Error(error.message || "Unable to load attendance.")
  return data ? mapRow(data) : null
}

export async function markCheckIn(employeeCode: string) {
  const client = getClient()
  const code = String(employeeCode || "").trim()
  if (!code) throw new Error("Missing employee code.")
  const now = new Date()
  const attendanceDate = toYMD(now)

  const { data: existing, error: existingError } = await client
    .from("attendance_records")
    .select("employee_code, attendance_date, check_in_at, check_out_at, status, work_minutes, overtime_minutes")
    .eq("employee_code", code)
    .eq("attendance_date", attendanceDate)
    .maybeSingle()
  if (existingError) throw new Error(existingError.message || "Unable to validate attendance.")
  if (existing?.check_out_at) {
    throw new Error("You already checked out for today. Check-in is locked.")
  }

  const nowIso = now.toISOString()
  const checkInMinutes = now.getHours() * 60 + now.getMinutes()
  const status = checkInMinutes <= 10 * 60 + 15 ? "On Time" : "Late"

  const { data, error } = await client
    .from("attendance_records")
    .upsert({
      employee_code: code,
      attendance_date: attendanceDate,
      check_in_at: nowIso,
      status,
      work_minutes: 0,
      overtime_minutes: 0,
    }, { onConflict: "employee_code,attendance_date" })
    .select("employee_code, attendance_date, check_in_at, check_out_at, status, work_minutes, overtime_minutes")
    .single()

  if (error) throw new Error(error.message || "Unable to check in.")
  return mapRow(data)
}

export async function markCheckOut(employeeCode: string) {
  const client = getClient()
  const code = String(employeeCode || "").trim()
  if (!code) throw new Error("Missing employee code.")

  const { data: current, error: readError } = await client
    .from("attendance_records")
    .select("employee_code, attendance_date, check_in_at, check_out_at, status, work_minutes, overtime_minutes")
    .eq("employee_code", code)
    .eq("attendance_date", toYMD())
    .maybeSingle()
  if (readError) throw new Error(readError.message || "Unable to load attendance.")
  if (!current?.check_in_at) throw new Error("Please check in first.")

  const nowIso = new Date().toISOString()
  const inMinutes = toMinutes(current.check_in_at)
  const outMinutes = toMinutes(nowIso)
  const workMinutes = inMinutes != null && outMinutes != null && outMinutes > inMinutes
    ? outMinutes - inMinutes
    : 0
  const overtimeMinutes = outMinutes != null ? Math.max(0, outMinutes - 18 * 60) : 0

  const { data, error } = await client
    .from("attendance_records")
    .update({
      check_out_at: nowIso,
      work_minutes: workMinutes,
      overtime_minutes: overtimeMinutes,
    })
    .eq("employee_code", code)
    .eq("attendance_date", toYMD())
    .select("employee_code, attendance_date, check_in_at, check_out_at, status, work_minutes, overtime_minutes")
    .single()

  if (error) throw new Error(error.message || "Unable to check out.")
  return mapRow(data)
}
