import { translateStatus, useTranslation } from '@/lib/i18n';

const colors: Record<string, string> = {
  PENDING: 'border-yellow-300 bg-yellow-50 text-yellow-900',
  IN_PROGRESS: 'border-blue-300 bg-blue-50 text-blue-900',
  RESOLVED: 'border-green-300 bg-green-50 text-green-900',
  REJECTED: 'border-red-300 bg-red-50 text-red-900',
};

export default function AdminStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${colors[status] ?? 'border-gray-300 bg-gray-50 text-gray-800'}`}>
      {translateStatus(status, t)}
    </span>
  );
}