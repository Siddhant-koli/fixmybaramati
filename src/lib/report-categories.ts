export const REPORT_CATEGORIES = [
  { value: 'Potholes', icon: '🕳️', translationKey: 'category.potholes' },
  { value: 'Garbage', icon: '🗑️', translationKey: 'category.garbage' },
  { value: 'Street Lights', icon: '💡', translationKey: 'category.streetLights' },
  { value: 'Water', icon: '💧', translationKey: 'category.water' },
  { value: 'Drainage', icon: '🌊', translationKey: 'category.drainage' },
  { value: 'Roads', icon: '🛣️', translationKey: 'category.roads' },
  { value: 'Other', icon: '📌', translationKey: 'category.other' },
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]['value'];

export const isReportCategory = (value: string): value is ReportCategory =>
  REPORT_CATEGORIES.some((category) => category.value === value);
