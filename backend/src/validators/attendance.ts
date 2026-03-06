import { z } from "zod";

export const markAttendanceSchema = z.object({
  employeeId: z.string().trim().min(1),
  date: z.string().trim().min(1), // parsed separately as YYYY-MM-DD
  status: z.enum(["Present", "Absent"]),
});

