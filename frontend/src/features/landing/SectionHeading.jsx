import React from 'react';

/**
 * Shared, admin-friendly section heading used across the public landing page.
 * Only structural chrome lives here — every headline/description is passed in
 * from admin settings or the database.
 */
export default function SectionHeading({ eyebrow, title, description, align = 'center', className = '' }) {
  if (!title && !eyebrow) return null;

  const isCentered = align === 'center';

  return (
    <div
      className={`${isCentered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}
    >
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0E7490] ${
            isCentered ? 'justify-center' : ''
          }`}
        >
          <span aria-hidden="true" className="h-[1px] w-6 bg-[#0E7490]/40" />
          {eyebrow}
          <span aria-hidden="true" className="h-[1px] w-6 bg-[#0E7490]/40" />
        </span>
      )}

      {title && (
        <h2 className="mt-3 text-[24px] font-semibold leading-[1.18] tracking-tight text-[#0E1111] sm:text-[30px] md:text-[36px]">
          {title}
        </h2>
      )}

      {description && (
        <p className="mt-3 text-[13px] leading-relaxed text-[#55605F] sm:text-sm">
          {description}
        </p>
      )}
    </div>
  );
}
