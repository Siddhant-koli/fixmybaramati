'use client';

type ReportPhotoProps = {
  src: string;
  alt: string;
  className: string;
};

export default function ReportPhoto({ src, alt, className }: ReportPhotoProps) {
  return (
    <img
      src={src}
      alt={alt}
      onError={(event) => {
        event.currentTarget.style.display = 'none';
      }}
      className={className}
    />
  );
}
