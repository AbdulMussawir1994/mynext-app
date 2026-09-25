"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Company, Department, EntityType } from "@/types";
import { CrudForm, Row } from "./FormType";

const empty: Record<EntityType, CrudForm> = {
  companies: {
    name: "",
    address: "",
  },
  departments: {
    name: "",
    companyId: 0,
  },
  employees: {
    name: "",
    email: "",
    salary: 0,
    isActive: true,
    departmentId: 0,
  },
};

export function CrudPage({
  entity,
  title,
}: {
  entity: EntityType;
  title: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState<CrudForm>({ ...empty[entity] });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  // Fetch data without updating React state.
  const fetchData = useCallback(async () => {
    const [data, cs, ds] = await Promise.all([
      api.list(entity),
      entity === "departments" || entity === "employees"
        ? api.list("companies")
        : Promise.resolve([]),
      entity === "employees" ? api.list("departments") : Promise.resolve([]),
    ]);

    return { data, cs, ds };
  }, [entity]);

  // Reload after a save or delete.
  // This is called from event handlers, not from the effect.
  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, cs, ds } = await fetchData();

      setRows(data);
      setCompanies(cs);
      setDepartments(ds);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // Initial fetch: update state only after the request settles.
  useEffect(() => {
    let ignore = false;

    async function initialLoad() {
      try {
        const { data, cs, ds } = await fetchData();

        if (ignore) return;

        setRows(data);
        setCompanies(cs);
        setDepartments(ds);
        setError("");
      } catch (e) {
        if (ignore) return;

        setError(e instanceof Error ? e.message : "Request failed");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => {
      ignore = true;
    };
  }, [fetchData]);

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        JSON.stringify(r).toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q],
  );

  function reset() {
    setEditId(null);
    setForm({ ...empty[entity] });
  }

  function edit(r: Row) {
    setEditId(r.id);

    // Copy only editable fields into the form.
    if ("departmentId" in r) {
      setForm({
        name: r.name,
        email: r.email,
        salary: r.salary,
        isActive: r.isActive,
        departmentId: r.departmentId,
      });
    } else if ("companyId" in r) {
      setForm({
        name: r.name,
        companyId: r.companyId,
      });
    } else {
      setForm({
        name: r.name,
        address: r.address,
      });
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      if (editId !== null) {
        await api.update(entity, editId, form);
      } else {
        await api.create(entity, form);
      }

      reset();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function del(id: number) {
    if (!confirm("Delete this record?")) return;

    setError("");

    try {
      await api.remove(entity, id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <>
      <div className="top">
        <div>
          <h1>{title}</h1>
          <p>Manage {title.toLowerCase()} from your existing API.</p>
        </div>

        <input
          className="search"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {error && <div className="error">{error}</div>}

      <div className="grid">
        <section className="panel">
          <h2>
            {editId !== null ? "Edit" : "Add"} {title.slice(0, -1)}
          </h2>

          <form onSubmit={submit}>
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            {entity === "companies" && (
              <label>
                Address
                <input
                  value={form.address ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </label>
            )}

            {entity === "departments" && (
              <label>
                Company
                <select
                  required
                  value={form.companyId || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      companyId: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Select</option>
                  {companies.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {entity === "employees" && (
              <>
                <label>
                  Email
                  <input
                    type="email"
                    required
                    value={form.email ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </label>

                <label>
                  Salary
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.salary ?? 0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        salary: Number(e.target.value),
                      })
                    }
                  />
                </label>

                <label>
                  Department
                  <select
                    required
                    value={form.departmentId || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        departmentId: Number(e.target.value),
                      })
                    }
                  >
                    <option value="">Select</option>
                    {departments.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="check">
                  <input
                    type="checkbox"
                    checked={form.isActive ?? false}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isActive: e.target.checked,
                      })
                    }
                  />{" "}
                  Active
                </label>
              </>
            )}

            <div className="actions">
              <button type="submit">
                {editId !== null ? "Update" : "Create"}
              </button>

              {editId !== null && (
                <button type="button" className="secondary" onClick={reset}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel tablewrap">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>

                  {entity === "companies" && <th>Address</th>}
                  {entity === "departments" && <th>Company</th>}

                  {entity === "employees" && (
                    <>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Salary</th>
                      <th>Status</th>
                    </>
                  )}

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.name}</td>

                    {entity === "companies" && "address" in r && (
                      <td>{r.address || "—"}</td>
                    )}

                    {entity === "departments" && "companyId" in r && (
                      <td>
                        {r.company?.name ||
                          companies.find((x) => x.id === r.companyId)?.name ||
                          r.companyId}
                      </td>
                    )}

                    {entity === "employees" && "departmentId" in r && (
                      <>
                        <td>{r.email}</td>
                        <td>
                          {r.department?.name ||
                            departments.find((x) => x.id === r.departmentId)
                              ?.name ||
                            r.departmentId}
                        </td>
                        <td>{Number(r.salary).toLocaleString()}</td>
                        <td>{r.isActive ? "Active" : "Inactive"}</td>
                      </>
                    )}

                    <td>
                      <button
                        type="button"
                        className="small"
                        onClick={() => edit(r)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="small danger"
                        onClick={() => del(r.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
