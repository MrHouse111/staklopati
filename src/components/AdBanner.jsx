/*
 * AdBanner component
 *
 * This component renders a simple placeholder for Google AdSense banners. In production,
 * this can be replaced with actual `<ins className="adsbygoogle">` markup or a
 * dynamic ad loading script. For now it displays a grey bar with the text “Google Ad”.
 */

export default function AdBanner() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-16 bg-gray-200 border-t border-gray-300 flex items-center justify-center z-50"
      style={{ fontSize: '14px' }}
    >
      Google Ad
    </div>
  );
}