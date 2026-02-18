'use client';

interface OutOfStockBadgeProps {
  /** When true, shows the overlay and "Out of stock" badge. Place inside a relative container (e.g. product image wrapper). */
  show: boolean;
  /** Optional class for the overlay to match parent border radius (e.g. rounded-xl). */
  overlayClassName?: string;
  /** Badge horizontal position when other badges (e.g. category) use top-left. */
  badgePosition?: 'left' | 'right';
}

export function OutOfStockBadge({ show, overlayClassName = '', badgePosition = 'left' }: OutOfStockBadgeProps) {
  if (!show) return null;
  const positionClass = badgePosition === 'right' ? 'top-2 right-2 left-auto' : 'top-2 left-2';
  return (
    <>
      <div
        className={`absolute inset-0 bg-black/45 flex items-center justify-center z-10 ${overlayClassName}`}
        aria-hidden
      />
      <span
        className={`absolute ${positionClass} z-20 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded shadow-sm uppercase tracking-wide`}
        aria-label="Out of stock"
      >
        Out of stock
      </span>
    </>
  );
}
