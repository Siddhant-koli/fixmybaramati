// Shared demo reports data for Phase 2.6 and Phase 2.7
// This is sample data for demonstration purposes only

export interface Report {
  id: number;
  title: string;
  category: string;
  description: string;
  dateReported: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  upvotes: number;
  icon: string;
}

export const demoReports: Report[] = [
  {
    id: 1,
    title: 'Large pothole near main road',
    category: 'Potholes',
    description:
      'A deep pothole approximately 2 feet wide has formed near the market intersection. It poses a risk to vehicles and pedestrians. Urgent repair needed.',
    dateReported: '2024-09-28',
    location: 'Main Road, Near Market, Baramati',
    latitude: 18.6298,
    longitude: 75.5244,
    status: 'In Progress',
    upvotes: 12,
    icon: '🕳️',
  },
  {
    id: 2,
    title: 'Garbage accumulation near market',
    category: 'Garbage',
    description:
      'Large amounts of garbage and waste have accumulated in the area near the central market. This is creating unhygienic conditions and attracting stray animals.',
    dateReported: '2024-09-27',
    location: 'Central Market, Baramati',
    latitude: 18.6310,
    longitude: 75.5255,
    status: 'Pending',
    upvotes: 8,
    icon: '🗑️',
  },
  {
    id: 3,
    title: 'Street light not working',
    category: 'Street Lights',
    description:
      'The street light at the corner of School Road has been non-functional for the past week. It needs immediate repair to ensure public safety at night.',
    dateReported: '2024-09-26',
    location: 'School Road, Baramati',
    latitude: 18.6280,
    longitude: 75.5200,
    status: 'Resolved',
    upvotes: 5,
    icon: '💡',
  },
  {
    id: 4,
    title: 'Water leakage from main pipeline',
    category: 'Water',
    description:
      'Water is leaking from the main pipeline near the residential area, causing wastage and flooding the street. Quick action required.',
    dateReported: '2024-09-25',
    location: 'Residential Colony, Baramati',
    latitude: 18.6320,
    longitude: 75.5290,
    status: 'Pending',
    upvotes: 15,
    icon: '💧',
  },
  {
    id: 5,
    title: 'Road surface deterioration',
    category: 'Roads',
    description:
      'The asphalt on the connecting road has deteriorated significantly, with multiple cracks and breaks. This affects traffic safety and vehicle conditions.',
    dateReported: '2024-09-24',
    location: 'Connecting Road, Baramati',
    latitude: 18.6270,
    longitude: 75.5150,
    status: 'In Progress',
    upvotes: 7,
    icon: '🛣️',
  },
  {
    id: 6,
    title: 'Drainage blockage causing flooding',
    category: 'Drainage',
    description:
      'The drainage system near the park is blocked, causing water to accumulate during rainfall. This creates health and safety hazards.',
    dateReported: '2024-09-23',
    location: 'Near Park, Baramati',
    latitude: 18.6340,
    longitude: 75.5180,
    status: 'Rejected',
    upvotes: 3,
    icon: '🌊',
  },
];

export function getReportById(id: string): Report | null {
  // Parse the demo ID format: demo-1, demo-2, etc.
  if (!id.startsWith('demo-')) {
    return null;
  }

  const reportId = parseInt(id.replace('demo-', ''), 10);
  return demoReports.find((report) => report.id === reportId) || null;
}
