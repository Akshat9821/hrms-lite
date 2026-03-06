import { z } from "zod";

export const createEmployeeSchema = z.object({
  employeeId: z.string().trim().min(1),
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
  department: z.string().trim().min(1),
});

