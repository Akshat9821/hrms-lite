"use client";

import type { Attendance } from "@/types/hrms";
import { formatISODate } from "@/lib/dates";

export function AttendanceTable(props: { attendance: Attendance[] }) {
  if (props.attendance.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <div className="text-sm font-medium text-zinc-900">No attendance records</div>
        <div className="mt-1 text-sm text-zinc-600">Mark attendance to see history here.</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {props.attendance.map((a) => (
            <tr key={a.id} className="hover:bg-zinc-50">
              <td className="px-4 py-3 font-medium text-zinc-900">{formatISODate(a.date)}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    a.status === "Present"
                      ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800"
                      : "rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-800"
                  }
                >
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

