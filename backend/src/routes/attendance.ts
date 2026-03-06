import { Router } from "express";
import { prisma } from "../prisma";
import { ApiError } from "../errors/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { markAttendanceSchema } from "../validators/attendance";
import { parseISODateOnly } from "../utils/date";

export const attendanceRouter = Router();

attendanceRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = markAttendanceSchema.parse(req.body);
    const date = parseISODateOnly(body.date);

    const employee = await prisma.employee.findUnique({
      where: { employeeId: body.employeeId },
      select: { employeeId: true },
    });
    if (!employee) {
      throw new ApiError({
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Employee not found",
        details: { employeeId: body.employeeId },
      });
    }

    // Upsert per employeeId+date is a nice UX, but spec asks duplicate protection (409)
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: { employeeId: body.employeeId, date },
      },
      select: { id: true },
    });
    if (existing) {
      throw new ApiError({
        statusCode: 409,
        code: "DUPLICATE_ATTENDANCE",
        message: "Attendance already marked for this employee on this date",
        details: { employeeId: body.employeeId, date: body.date },
      });
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: body.employeeId,
        date,
        status: body.status,
      },
    });

    res.status(201).json({ data: attendance });
  }),
);

attendanceRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const dateQuery = req.query.date;
    if (typeof dateQuery !== "string" || !dateQuery.trim()) {
      throw new ApiError({
        statusCode: 400,
        code: "BAD_REQUEST",
        message: "date query param is required (YYYY-MM-DD)",
      });
    }
    const date = parseISODateOnly(dateQuery);

    const rows = await prisma.attendance.findMany({
      where: { date },
      include: {
        employee: { select: { employeeId: true, fullName: true, department: true } },
      },
      orderBy: { employeeId: "asc" },
    });

    res.status(200).json({ data: rows });
  }),
);

attendanceRouter.get(
  "/:employeeId",
  asyncHandler(async (req, res) => {
    const raw = (req.params as any).employeeId as string | string[] | undefined;
    const employeeId = Array.isArray(raw) ? raw[0] : raw;
    if (!employeeId) {
      throw new ApiError({
        statusCode: 400,
        code: "BAD_REQUEST",
        message: "Missing employeeId",
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeId },
      select: {
        employeeId: true,
        fullName: true,
        email: true,
        department: true,
        createdAt: true,
      },
    });
    if (!employee) {
      throw new ApiError({
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Employee not found",
        details: { employeeId },
      });
    }

    const attendance = await prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { date: "desc" },
    });

    const totalPresentDays = await prisma.attendance.count({
      where: { employeeId, status: "Present" },
    });

    res.status(200).json({
      data: { employee, attendance, totalPresentDays },
    });
  }),
);

