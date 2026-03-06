export type Employee = {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: string;
};

export type AttendanceStatus = "Present" | "Absent";

export type Attendance = {
  id: string;
  employeeId: string;
  date: string; // ISO date
  status: AttendanceStatus;
};

export type AttendanceWithEmployee = Attendance & {
  employee: Pick<Employee, "employeeId" | "fullName" | "department">;
};

