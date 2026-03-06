"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getApiErrorMessage } from "@/lib/api";
import type { Employee } from "@/types/hrms";
import { EmployeeTable } from "@/components/EmployeeTable";
import { AddEmployeeModal } from "@/components/AddEmployeeModal";

export default function EmployeesPage() {
  const [open, setOpen] = useState(false);

  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await api.get<{ data: Employee[] }>("/employees");
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="mt-1 text-sm text-zinc-600">Add, view, and delete employees.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Add employee
        </button>
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
        <EmployeeTable employees={employeesQuery.data ?? []} />
      )}

      <AddEmployeeModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

