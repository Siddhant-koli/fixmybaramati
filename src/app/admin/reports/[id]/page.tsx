import AdminReportDetail from '@/app/admin/reports/[id]/AdminReportDetail';

export default async function AdminReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminReportDetail reportId={id} />;
}