// This layout wraps orphaned (dashboard) group pages — functionally unused
// since all routes now live under app/dashboard/
export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
