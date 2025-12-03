/**
 * Notification Badge Component
 * Shows unread notification count
 */
const NotificationBadge = ({ count = 0 }) => {
  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;

