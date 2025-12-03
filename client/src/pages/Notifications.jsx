import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../services/api';
import { Link } from 'react-router-dom';

/**
 * Notifications Page
 * View and manage notifications
 */
const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [filter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      const params = {};
      if (filter === 'unread') params.read = 'false';
      if (filter === 'read') params.read = 'true';
      if (typeFilter !== 'all') params.type = typeFilter;

      const response = await notificationService.getAll(params);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      module_assigned: '📚',
      lesson_completed: '✅',
      quiz_submitted: '📝',
      grade_received: '🎯',
      group_updated: '👥',
      discussion_new: '💬',
      system: '🔔'
    };
    return icons[type] || '🔔';
  };

  const getNotificationLink = (notification) => {
    if (notification.relatedEntity?.entityType === 'module') {
      return `/modules/${notification.relatedEntity.entityId}`;
    }
    if (notification.relatedEntity?.entityType === 'discussion') {
      return `/discussions/${notification.relatedEntity.entityId}`;
    }
    if (notification.relatedEntity?.entityType === 'group') {
      return `/groups/${notification.relatedEntity.entityId}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="section-header mb-0">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-3 badge-primary">
              {unreadCount} non lues
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn-outline"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Statut</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Toutes</option>
              <option value="unread">Non lues</option>
              <option value="read">Lues</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Tous</option>
              <option value="module_assigned">Module assigné</option>
              <option value="lesson_completed">Leçon complétée</option>
              <option value="quiz_submitted">Quiz soumis</option>
              <option value="grade_received">Note reçue</option>
              <option value="group_updated">Groupe modifié</option>
              <option value="discussion_new">Nouvelle discussion</option>
              <option value="system">Système</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Aucune notification
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const link = getNotificationLink(notification);
            const NotificationContent = (
              <div
                className={`card cursor-pointer transition-all ${
                  notification.read
                    ? 'bg-white dark:bg-gray-800'
                    : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(notification.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            );

            return link ? (
              <Link key={notification._id} to={link}>
                {NotificationContent}
              </Link>
            ) : (
              <div key={notification._id}>
                {NotificationContent}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;

