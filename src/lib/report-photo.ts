export const getReportPhotoUrl = (reportId: string): string =>
  `/api/reports/${encodeURIComponent(reportId)}/photo`;
