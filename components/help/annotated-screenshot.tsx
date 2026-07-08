import Image from "next/image";

export function AnnotatedScreenshot({
  src,
  alt,
  width,
  height,
  markers,
  label,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  label?: string;
  markers: {
    /** Percent coordinates (0-100) of the highlighted box, centered on the target. */
    top: number;
    left: number;
    boxWidth: number;
    boxHeight: number;
  }[];
}) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-elevated">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="block h-auto w-full"
        sizes="(max-width: 768px) 100vw, 720px"
      />
      {markers.map((m, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full border-[3px] border-danger shadow-[0_0_0_4px_rgba(178,58,58,0.15)]"
          style={{
            top: `${m.top - m.boxHeight / 2}%`,
            left: `${m.left - m.boxWidth / 2}%`,
            width: `${m.boxWidth}%`,
            height: `${m.boxHeight}%`,
          }}
        />
      ))}
      {label && (
        <div
          className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center"
          style={{
            top: `${markers[0].top - markers[0].boxHeight / 2 - 12}%`,
            left: `${markers[0].left}%`,
          }}
        >
          <span className="mb-1 whitespace-nowrap rounded-full bg-danger px-3 py-1 text-xs font-semibold text-white shadow-elevated">
            {label}
          </span>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none" className="text-danger">
            <path d="M9 0v18M9 21l-6-8h12l-6 8z" fill="currentColor" />
          </svg>
        </div>
      )}
    </div>
  );
}
