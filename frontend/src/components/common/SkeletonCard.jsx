// ============================================================================
// SkeletonCard — Animated placeholder that mirrors a real card's layout
// ============================================================================
//
// Why skeletons instead of spinners?
// Spinners tell users "something is loading" but give no hint about WHAT
// is loading or how the page will look. Skeletons set layout expectations
// by showing the exact shapes that content will fill — text lines, images,
// badges. This reduces perceived load time and prevents layout shift.
//
// The pulse animation speed is intentionally gentle (1.5s) to feel natural
// and not cause distraction for elderly users.
// ============================================================================

// Pulse animation duration — slow enough to feel calm, not frantic
const PULSE_DURATION = 'animate-pulse';

/**
 * A skeleton placeholder card that mimics a typical place/trip card.
 * Used in Dashboard, BrowsePlaces, and MyItineraries while data loads.
 *
 * @param {{ variant?: 'card'|'stat'|'trip' }} props
 *   - card: Image + title + subtitle (BrowsePlaces)
 *   - stat: Icon circle + text lines (Dashboard stat cards)
 *   - trip: Full trip card (MyItineraries)
 */
const SkeletonCard = ({ variant = 'card' }) => {

  if (variant === 'stat') {
    return (
      <div
        className={`bg-surface border border-border p-6 rounded-3xl flex items-center gap-4 ${PULSE_DURATION}`}
        role="status"
        aria-label="Loading statistic"
      >
        <div className="w-12 h-12 rounded-2xl bg-input-bg" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-input-bg rounded w-24" />
          <div className="h-6 bg-input-bg rounded w-16" />
        </div>
      </div>
    );
  }

  if (variant === 'trip') {
    return (
      <div
        className={`bg-surface border border-border rounded-2xl p-6 space-y-4 ${PULSE_DURATION}`}
        role="status"
        aria-label="Loading trip"
      >
        <div className="h-6 bg-input-bg rounded w-3/4" />
        <div className="space-y-2 bg-input-bg/50 p-4 rounded-xl border border-border">
          <div className="h-4 bg-input-bg rounded w-1/2" />
          <div className="h-4 bg-input-bg rounded w-2/3" />
          <div className="h-4 bg-input-bg rounded w-1/3" />
          <div className="h-4 bg-input-bg rounded w-2/5" />
        </div>
        <div className="h-10 bg-input-bg rounded-xl w-full" />
      </div>
    );
  }

  // Default: card variant (BrowsePlaces)
  return (
    <div
      className={`bg-surface border border-border rounded-xl overflow-hidden ${PULSE_DURATION}`}
      role="status"
      aria-label="Loading place"
    >
      {/* Image skeleton */}
      <div className="w-full h-44 bg-input-bg" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-input-bg rounded w-3/4" />
        <div className="h-4 bg-input-bg rounded w-1/3" />
        <div className="h-6 bg-input-bg rounded-full w-24" />
        <div className="flex justify-between">
          <div className="h-4 bg-input-bg rounded w-16" />
          <div className="h-4 bg-input-bg rounded w-12" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
