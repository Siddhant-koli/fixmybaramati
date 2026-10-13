type MapPreviewProps = {
  latitude?: number | string | null;
  longitude?: number | string | null;
  title?: string;
  location?: string | null;
  heightClassName?: string;
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function MapPreview({
  latitude,
  longitude,
  title,
  location,
  heightClassName = 'h-64',
}: MapPreviewProps) {
  const parsedLatitude = toNumber(latitude);
  const parsedLongitude = toNumber(longitude);

  if (parsedLatitude === null || parsedLongitude === null) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100 p-6 text-center">
        <div className="mb-2 text-4xl">🗺️</div>
        <h4 className="font-semibold text-gray-900">Map preview</h4>
        <p className="mt-1 text-sm text-gray-600">
          {location || 'Add coordinates to show the exact report location on a map.'}
        </p>
      </div>
    );
  }

  const delta = 0.02;
  const west = Math.max(-180, parsedLongitude - delta);
  const east = Math.min(180, parsedLongitude + delta);
  const south = Math.max(-90, parsedLatitude - delta);
  const north = Math.min(90, parsedLatitude + delta);
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${west},${south},${east},${north}&layer=mapnik&marker=${parsedLatitude},${parsedLongitude}`;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
      <iframe
        title={title ?? 'Report location map preview'}
        src={mapUrl}
        loading="lazy"
        className={`${heightClassName} w-full border-0`}
        allowFullScreen
      />
      <div className="border-t border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
        <span className="font-medium text-gray-800">Location:</span>{' '}
        {location || `${parsedLatitude.toFixed(6)}, ${parsedLongitude.toFixed(6)}`}
      </div>
    </div>
  );
}
