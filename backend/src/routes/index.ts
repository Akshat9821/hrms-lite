import { Router } from "express";
import { employeesRouter } from "./employees";
import { attendanceRouter } from "./attendance";

export const apiRouter = Router();

apiRouter.use("/employees", employeesRouter);
apiRouter.use("/attendance", attendanceRouter);

