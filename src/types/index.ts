export type Company = { id: number; name: string; address?: string };
export type Department = {
  id: number;
  name: string;
  companyId: number;
  company?: Company;
};
export type Employee = {
  id: number;
  name: string;
  email: string;
  salary: number;
  isActive: boolean;
  departmentId: number;
  department?: Department;
};
export type EntityType = "companies" | "departments" | "employees";
