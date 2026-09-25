import Link from "next/link";
export default function Home() {
  return (
    <>
      <div className="hero">
        <span>Next.js 16.3.5 + TypeScript</span>
        <h1>Company Management</h1>
        <p>
          High-performance CRUD frontend for your existing ASP.NET Core Company
          → Department → Employee APIs.
        </p>
      </div>
      <div className="cards">
        {[
          ["Companies", "/companies"],
          ["Departments", "/departments"],
          ["Employees", "/employees"],
        ].map(([x, u]) => (
          <Link className="card" href={u} key={u}>
            <h2>{x}</h2>
            <p>View, create, edit and delete {x.toLowerCase()}.</p>
          </Link>
        ))}
      </div>
    </>
  );
}
