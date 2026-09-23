export default function JamSponsorDisplay({
  sponsors = [],
  appearance = 'grid',
  columns = 3,
  title = 'SPONSORED BY',
  titleClasses = 'text-xs uppercase text-orange-300 leading-none',
  itemClassName = 'bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10',
  imageClassName = 'h-10 sm:h-12',
  textClassName = 'text-xs text-orange-100',
  showText = true,
  isCircular = false,
}) {
  if (!Array.isArray(sponsors) || sponsors.length === 0) return null;

  const layoutClass = appearance === 'row'
    ? 'flex flex-wrap justify-center items-center gap-3'
    : 'grid place-items-center gap-3';

  const gridStyle = appearance === 'grid'
    ? { gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))` }
    : undefined;

  return (
    <div className="flex flex-col items-center gap-2">
      {title && <span className={titleClasses}>{title}</span>}

      <div className={layoutClass} style={gridStyle}>
        {sponsors.map((sponsor, index) => {
          const href = sponsor.href || sponsor.website_url || '#';
          const alt = sponsor.alt || sponsor.name || 'Sponsor';
          const imgSrc = sponsor.imgSrc || sponsor.logo_url || sponsor.logo_filename || sponsor.image || sponsor.logo || '/images/placeholder-image.png';
          const text = sponsor.text || sponsor.name || alt;

          return (
            <a
              key={`${alt}-${index}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={alt}
              aria-label={alt}
              className={`group inline-flex items-center justify-center ${itemClassName} ${appearance === 'row' ? 'min-w-[120px]' : 'w-full min-h-[70px]'}`}
            >
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={alt}
                    className={`${imageClassName} w-auto object-contain ${isCircular ? 'rounded-full' : ''}`}
                  />
                ) : null}

                {showText && text && (
                  <span className={textClassName}>{text}</span>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
