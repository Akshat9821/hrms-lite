"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getApiErrorMessage } from "@/lib/api";
import type { Employee } from "@/types/hrms";

export function EmployeeTable(props: { employees: Employee[] }) {
  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/employees/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  if (props.employees.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <div className="text-sm font-medium text-zinc-900">No employees yet</div>
        <div className="mt-1 text-sm text-zinc-600">Add your first employee to get started.</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
          <tr>
            <th className="px-4 py-3">Employee ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {props.employees.map((e) => (
            <tr key={e.id} className="hover:bg-zinc-50">
              <td className="px-4 py-3 font-medium text-zinc-900">{e.employeeId}</td>
              <td className="px-4 py-3 text-zinc-900">{e.fullName}</td>
              <td className="px-4 py-3 text-zinc-700">{e.email}</td>
              <td className="px-4 py-3 text-zinc-700">{e.department}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => deleteMutation.mutate(e.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deleteMutation.isError ? (
        <div className="border-t border-zinc-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {getApiErrorMessage(deleteMutation.error)}
        </div>
      ) : null}
    </div>
  );
}

