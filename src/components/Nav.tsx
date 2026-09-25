import Link from "next/link";
export function Nav() {
  return (
    <aside className="nav">
      <h2>Enterprise CRUD</h2>
      <p>Next.js 16</p>
      <Link href="/">Dashboard</Link>
      <Link href="/companies">Companies</Link>
      <Link href="/departments">Departments</Link>
      <Link href="/employees">Employees</Link>
    </aside>
  );
}
