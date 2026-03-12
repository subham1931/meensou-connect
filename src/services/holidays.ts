import { assertSupabaseConfigured, supabase } from "../lib/supabase"

export type HolidayItem = {
  id: string
  holidayDate: string
  holidayName: string
}

function getClient() {
  assertSupabaseConfigured()
  return supabase!
}

function mapRow(row: any): HolidayItem {
  return {
    id: row.id || "",
    holidayDate: row.holiday_date || "",
    holidayName: row.holiday_name || "",
  }
}

export async function listHolidays() {
  const client = getClient()
  const { data, error } = await client
    .from("holidays")
    .select("id, holiday_date, holiday_name")
    .order("holiday_date", { ascending: true })

  if (error) throw new Error(error.message || "Unable to load holidays.")
  return (data || []).map(mapRow)
}
