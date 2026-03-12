import AsyncStorage from "@react-native-async-storage/async-storage"
import { assertSupabaseConfigured, supabase } from "../lib/supabase"

export type EmployeeProfile = {
  employeeCode: string
  fullName: string
  department: string
  designation: string
  officeEmail: string
  mobile: string
  profileImageUrl: string
}

const MOBILE_EMPLOYEE_SESSION_KEY = "mc_employee_session"

function normalizeIdentifier(value: string) {
  const input = String(value || "").trim()
  if (!input) return ""
  return input
}

function getSupabaseClient() {
  assertSupabaseConfigured()
  return supabase!
}

function mapEmployeeRowToProfile(row: any): EmployeeProfile {
  return {
    employeeCode: row.employee_code || "",
    fullName: row.full_name || "Employee",
    department: row.department || "",
    designation: row.designation || "",
    officeEmail: row.office_email || "",
    mobile: row.mobile || "",
    profileImageUrl: row.profile_image_url || "",
  }
}

async function fetchEmployeeByIdentifier(identifier: string) {
  const client = getSupabaseClient()
  const normalized = normalizeIdentifier(identifier)
  if (!normalized) return null
  const normalizedLower = normalized.toLowerCase()

  const { data, error } = await client
    .from("employees")
    .select("employee_code, full_name, department, designation, office_email, username, password, mobile, profile_image_url, employment_status")
    .or(`office_email.eq.${normalizedLower},username.eq.${normalizedLower}`)
    .maybeSingle()

  if (error) throw new Error(error.message || "Failed to load employee profile.")
  return data || null
}

async function fetchEmployeeByCode(employeeCode: string) {
  const client = getSupabaseClient()
  const code = String(employeeCode || "").trim()
  if (!code) return null

  const { data, error } = await client
    .from("employees")
    .select("employee_code, full_name, department, designation, office_email, mobile, profile_image_url, employment_status")
    .eq("employee_code", code)
    .maybeSingle()

  if (error) throw new Error(error.message || "Failed to refresh employee profile.")
  return data || null
}

export async function signInEmployee(identifier: string, password: string) {
  getSupabaseClient()
  const loginId = normalizeIdentifier(identifier)
  const plainPassword = String(password || "")

  if (!loginId || !plainPassword.trim()) {
    throw new Error("Please enter office email/username and password.")
  }

  const employeeRow = await fetchEmployeeByIdentifier(loginId)
  if (!employeeRow) throw new Error("Invalid username/email or password.")

  const status = String(employeeRow.employment_status || "").trim().toLowerCase()
  if (status && status !== "active") {
    throw new Error("This employee account is inactive.")
  }

  if (String(employeeRow.password || "") !== plainPassword) {
    throw new Error("Invalid username/email or password.")
  }

  const profile = mapEmployeeRowToProfile(employeeRow)
  await AsyncStorage.setItem(MOBILE_EMPLOYEE_SESSION_KEY, JSON.stringify(profile))
  return {
    employee: profile,
  }
}

export async function getCurrentEmployeeSession() {
  const raw = await AsyncStorage.getItem(MOBILE_EMPLOYEE_SESSION_KEY)
  if (!raw) return null
  try {
    const cachedEmployee = JSON.parse(raw) as EmployeeProfile
    if (!cachedEmployee?.officeEmail && !cachedEmployee?.employeeCode) return null

    try {
      const refreshedRow = await fetchEmployeeByCode(cachedEmployee.employeeCode)
      if (refreshedRow) {
        const refreshedProfile = mapEmployeeRowToProfile(refreshedRow)
        await AsyncStorage.setItem(MOBILE_EMPLOYEE_SESSION_KEY, JSON.stringify(refreshedProfile))
        return { employee: refreshedProfile }
      }
    } catch {
      // Fall back to cached profile if refresh fails (offline/network issue).
    }

    return { employee: cachedEmployee }
  } catch {
    return null
  }
}

export async function signOutEmployee() {
  await AsyncStorage.removeItem(MOBILE_EMPLOYEE_SESSION_KEY)
}
