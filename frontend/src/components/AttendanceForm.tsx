"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getApiErrorMessage } from "@/lib/api";
import type { Attendance, AttendanceStatus, Employee } from "@/types/hrms";
import { todayISODateOnly } from "@/lib/dates";

export function AttendanceForm(props: {
  employees: Employee[];
  selectedEmployeeId: string;
  onSelectedEmployeeIdChange: (employeeId: string) => void;
}) {
  const qc = useQueryClient();
  const [date, setDate] = useState(todayISODateOnly());
  const [status, setStatus] = useState<AttendanceStatus>("Present");

  const canSubmit = useMemo(() => {
    return props.selectedEmployeeId.trim() && date.trim() && status;
  }, [props.selectedEmployeeId, date, status]);

  const markMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ data: Attendance }>("/attendance", {
        employeeId: props.selectedEmployeeId,
        date,
        status,
      });
      return res.data.data;
    },
    onSuccess: async (_data) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["attendanceByEmployee", props.selectedEmployeeId] }),
        qc.invalidateQueries({ queryKey: ["attendanceByDate", date] }),
      ]);
    },
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="text-base font-semibold">Mark attendance</div>
      <div className="mt-1 text-sm text-zinc-600">Select employee, date and status.</div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block space-y-1">
          <div className="text-sm font-medium text-zinc-800">Employee</div>
          <select
            value={props.selectedEmployeeId}
            onChange={(e) => props.onSelectedEmployeeIdChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4"
          >
            <option value="">Select…</option>
            {props.employees.map((e) => (
              <option key={e.id} value={e.employeeId}>
                {e.employeeId} — {e.fullName}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <div className="text-sm font-medium text-zinc-800">Date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4"
          />
        </label>

        <label className="block space-y-1">
          <div className="text-sm font-medium text-zinc-800">Status</div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4"
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </label>
      </div>

      {markMutation.isError ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {getApiErrorMessage(markMutation.error)}
        </div>
      ) : markMutation.isSuccess ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Attendance saved.
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-end">
        <button
          onClick={() => markMutation.mutate()}
          disabled={!canSubmit || markMutation.isPending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {markMutation.isPending ? "Saving…" : "Mark attendance"}
        </button>
      </div>
    </div>
  );
}

