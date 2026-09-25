import "./globals.css";
import { Nav } from "@/components/Nav";
export const metadata = {
  title: "Company CRUD",
  description: "Next.js Company Department Employee CRUD",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
