import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { notificationService } from '../services/api';
import NotificationBadge from './NotificationBadge';

/**
 * User Menu Component
 * Dropdown menu with avatar, profile, notifications, and logout
 */
const UserMenu = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnread();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return user.avatar.startsWith('http') 
        ? user.avatar 
        : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.avatar}`;
    }
    return null;
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {getAvatarUrl() ? (
          <img
            src={getAvatarUrl()}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold">
            {getInitials()}
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
          {user?.name}
        </span>
        <NotificationBadge count={unreadCount} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span>👤</span>
              <span>Profil</span>
            </Link>
            
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            >
              <span>🔔</span>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>

            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <>
                <Link
                  to="/discussions"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span>💬</span>
                  <span>Discussions</span>
                </Link>
                {user?.role === 'teacher' && (
                  <Link
                    to="/grading"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span>📝</span>
                    <span>Notation</span>
                  </Link>
                )}
              </>
            )}

            {user?.role === 'student' && (
              <Link
                to="/discussions"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span>💬</span>
                <span>Discussions</span>
              </Link>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
            >
              <span>🚪</span>
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;

