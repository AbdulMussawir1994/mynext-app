import { Company, Department, Employee } from "@/types";

export type Row = Company | Department | Employee;

export type CrudForm = {
  name: string;
  address?: string;
  companyId?: number;
  email?: string;
  salary?: number;
  isActive?: boolean;
  departmentId?: number;
};