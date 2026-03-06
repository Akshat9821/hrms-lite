"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getApiErrorMessage } from "@/lib/api";
import type { Employee } from "@/types/hrms";

type CreateEmployeeInput = Pick<Employee, "employeeId" | "fullName" | "email" | "department">;

export function AddEmployeeModal(props: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<CreateEmployeeInput>({
    employeeId: "",
    fullName: "",
    email: "",
    department: "",
  });

  const canSubmit = useMemo(() => {
    return (
      form.employeeId.trim() &&
      form.fullName.trim() &&
      form.email.trim() &&
      form.department.trim()
    );
  }, [form]);

  const createMutation = useMutation({
    mutationFn: async (input: CreateEmployeeInput) => {
      const res = await api.post<{ data: Employee }>("/employees", input);
      return res.data.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["employees"] });
      setForm({ employeeId: "", fullName: "", email: "", department: "" });
      props.onClose();
    },
  });

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <div className="text-base font-semibold">Add employee</div>
            <div className="text-xs text-zinc-500">All fields are required.</div>
          </div>
          <button
            onClick={props.onClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
          >
            Close
          </button>
        </div>

        <form
          className="space-y-4 px-5 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit || createMutation.isPending) return;
            createMutation.mutate(form);
          }}
        >
          <Field label="Employee ID" placeholder="EMP-004" value={form.employeeId} onChange={(v) => setForm((p) => ({ ...p, employeeId: v }))} />
          <Field label="Full name" placeholder="John Doe" value={form.fullName} onChange={(v) => setForm((p) => ({ ...p, fullName: v }))} />
          <Field label="Email" placeholder="john@example.com" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
          <Field label="Department" placeholder="Engineering" value={form.department} onChange={(v) => setForm((p) => ({ ...p, department: v }))} />

          {createMutation.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {getApiErrorMessage(createMutation.error)}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={props.onClose}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || createMutation.isPending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending ? "Saving…" : "Add employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <div className="text-sm font-medium text-zinc-800">{props.label}</div>
      <input
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4"
      />
    </label>
  );
}

