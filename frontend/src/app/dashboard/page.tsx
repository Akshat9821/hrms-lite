"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getApiErrorMessage } from "@/lib/api";
import type { AttendanceWithEmployee, Employee } from "@/types/hrms";
import { todayISODateOnly } from "@/lib/dates";

export default function DashboardPage() {
  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await api.get<{ data: Employee[] }>("/employees");
      return res.data.data;
    },
  });

  const today = todayISODateOnly();
  const attendanceTodayQuery = useQuery({
    queryKey: ["attendanceByDate", today],
    queryFn: async () => {
      const res = await api.get<{ data: AttendanceWithEmployee[] }>("/attendance", {
        params: { date: today },
      });
      return res.data.data;
    },
  });

  const totalEmployees = employeesQuery.data?.length ?? 0;
  const totalPresentToday = useMemo(() => {
    const rows = attendanceTodayQuery.data ?? [];
    return rows.filter((r) => r.status === "Present").length;
  }, [attendanceTodayQuery.data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Quick overview of employees and today&apos;s attendance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="Total employees"
          value={
            employeesQuery.isLoading ? "Loading…" : employeesQuery.isError ? "—" : String(totalEmployees)
          }
          subtitle={employeesQuery.isError ? getApiErrorMessage(employeesQuery.error) : " "}
        />
        <StatCard
          title={`Present today (${today})`}
          value={
            attendanceTodayQuery.isLoading
              ? "Loading…"
              : attendanceTodayQuery.isError
                ? "—"
                : String(totalPresentToday)
          }
          subtitle={attendanceTodayQuery.isError ? getApiErrorMessage(attendanceTodayQuery.error) : " "}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium text-zinc-900">Notes</div>
        <div className="mt-2 text-sm text-zinc-600">
          Attendance for today is counted from records created via the Attendance page (status =
          Present).
        </div>
      </div>
    </div>
  );
}

function StatCard(props: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="text-sm text-zinc-600">{props.title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{props.value}</div>
      <div className="mt-2 min-h-5 text-xs text-zinc-500">{props.subtitle}</div>
    </div>
  );
}

