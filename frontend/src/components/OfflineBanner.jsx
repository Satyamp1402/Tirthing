import useNetworkStatus from '../hooks/useNetworkStatus';

/**
 * A non-blocking banner that slides down from the top of the screen when
 * the user goes offline. It reassures them that saved data is still accessible.
 *
 * Animation approach:
 * - The banner is always in the DOM but translated off-screen when online.
 * - When offline, it slides down with a CSS transform transition.
 * - When connectivity returns, it slides back up and auto-hides.
 * - Using translate-y + opacity gives a smooth, GPU-accelerated animation
 *   that doesn't trigger layout reflows.
 */
const OfflineBanner = () => {
  const { isOnline } = useNetworkStatus();

  return (
    <div
      // The wrapper sits at the top of the viewport, fixed so it overlays content.
      // transition-all + duration-500 gives a half-second smooth slide.
      // When online: -translate-y-full pushes it completely above the viewport.
      // When offline: translate-y-0 brings it into view.
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-500 ease-in-out
        ${isOnline ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
      `}
    >
      {/* Inner bar with saffron theme colors and a subtle bottom shadow */}
      <div className="bg-orange-500 text-white text-center py-2.5 px-4 text-sm font-medium shadow-md">
        <span className="inline-flex items-center gap-2">
          {/* Pulsing dot draws attention to the offline state */}
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
          You're offline — your saved itineraries are still available
        </span>
      </div>
    </div>
  );
};

export default OfflineBanner;
