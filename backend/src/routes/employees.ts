import { Router } from "express";
import { prisma } from "../prisma";
import { ApiError } from "../errors/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { createEmployeeSchema } from "../validators/employees";

export const employeesRouter = Router();

employeesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ data: employees });
  }),
);

employeesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createEmployeeSchema.parse(req.body);

    const existing = await prisma.employee.findUnique({
      where: { employeeId: body.employeeId },
      select: { id: true },
    });
    if (existing) {
      throw new ApiError({
        statusCode: 409,
        code: "DUPLICATE_EMPLOYEE",
        message: "employeeId already exists",
        details: { employeeId: body.employeeId },
      });
    }

    const employee = await prisma.employee.create({
      data: body,
    });
    res.status(201).json({ data: employee });
  }),
);

employeesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const raw = (req.params as any).id as string | string[] | undefined;
    const id = Array.isArray(raw) ? raw[0] : raw;
    if (!id) {
      throw new ApiError({
        statusCode: 400,
        code: "BAD_REQUEST",
        message: "Missing employee id",
      });
    }
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError({
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Employee not found",
      });
    }

    await prisma.employee.delete({ where: { id } });
    res.status(204).send();
  }),
);

