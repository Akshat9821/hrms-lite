"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getApiErrorMessage } from "@/lib/api";
import type { Attendance, AttendanceWithEmployee, Employee } from "@/types/hrms";
import { AttendanceForm } from "@/components/AttendanceForm";
import { AttendanceTable } from "@/components/AttendanceTable";
import { todayISODateOnly, formatISODate } from "@/lib/dates";

type AttendanceHistoryResponse = {
  data: {
    employee: Pick<Employee, "employeeId" | "fullName" | "email" | "department" | "createdAt">;
    attendance: Attendance[];
    totalPresentDays: number;
  };
};

export default function AttendancePage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>(todayISODateOnly());

  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await api.get<{ data: Employee[] }>("/employees");
      return res.data.data;
    },
  });

  const historyQuery = useQuery({
    queryKey: ["attendanceByEmployee", selectedEmployeeId],
    enabled: Boolean(selectedEmployeeId),
    queryFn: async () => {
      const res = await api.get<AttendanceHistoryResponse>(`/attendance/${selectedEmployeeId}`);
      return res.data.data;
    },
  });

  const byDateQuery = useQuery({
    queryKey: ["attendanceByDate", filterDate],
    queryFn: async () => {
      const res = await api.get<{ data: AttendanceWithEmployee[] }>("/attendance", {
        params: { date: filterDate },
      });
      return res.data.data;
    },
  });

  const employeeOptions = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data]);
  const selectedEmployeeLabel = useMemo(() => {
    const emp = employeeOptions.find((e) => e.employeeId === selectedEmployeeId);
    return emp ? `${emp.employeeId} — ${emp.fullName}` : "";
  }, [employeeOptions, selectedEmployeeId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Mark attendance and view history per employee. Bonus: filter by date.
        </p>
      </div>

      {employeesQuery.isLoading ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-600">
          Loading employees…
        </div>
      ) : employeesQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {getApiErrorMessage(employeesQuery.error)}
        </div>
      ) : (
        <AttendanceForm
          employees={employeeOptions}
          selectedEmployeeId={selectedEmployeeId}
          onSelectedEmployeeIdChange={setSelectedEmployeeId}
        />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-base font-semibold">Employee history</div>
              <div className="text-sm text-zinc-600">
                {selectedEmployeeId ? selectedEmployeeLabel : "Select an employee to view history."}
              </div>
            </div>
            {historyQuery.data ? (
              <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700">
                Total present:{" "}
                <span className="font-semibold text-zinc-900">
                  {historyQuery.data.totalPresentDays}
                </span>
              </div>
            ) : null}
          </div>

          {selectedEmployeeId ? (
            historyQuery.isLoading ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-600">
                Loading history…
              </div>
            ) : historyQuery.isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                {getApiErrorMessage(historyQuery.error)}
              </div>
            ) : (
              <AttendanceTable attendance={historyQuery.data?.attendance ?? []} />
            )
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-600">
              Pick an employee above to load their attendance history.
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-base font-semibold">Filter by date</div>
              <div className="text-sm text-zinc-600">All attendance records for a specific date.</div>
            </div>
            <label className="block space-y-1">
              <div className="text-xs font-medium text-zinc-700">Date</div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4"
              />
            </label>
          </div>

          {byDateQuery.isLoading ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-600">
              Loading records…
            </div>
          ) : byDateQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {getApiErrorMessage(byDateQuery.error)}
            </div>
          ) : byDateQuery.data && byDateQuery.data.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                {byDateQuery.data.length} record(s) on{" "}
                <span className="font-medium text-zinc-900">{formatISODate(filterDate)}</span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-xs uppercase tracking-wide text-zinc-600">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {byDateQuery.data.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-900">{r.employee.fullName}</div>
                        <div className="text-xs text-zinc-500">{r.employee.employeeId}</div>
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{r.employee.department}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            r.status === "Present"
                              ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800"
                              : "rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-800"
                          }
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <div className="text-sm font-medium text-zinc-900">No records for this date</div>
              <div className="mt-1 text-sm text-zinc-600">
                Try a different date or mark attendance first.
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

