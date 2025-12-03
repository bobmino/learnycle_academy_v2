import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { discussionService, userService } from '../services/api';

/**
 * Discussions Page
 * View and manage discussions
 */
const Discussions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [discussions, setDiscussions] = useState([]);
  const [currentDiscussion, setCurrentDiscussion] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    receiverId: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchData();
    if (id) {
      fetchDiscussion(id);
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [discussionsRes, usersRes] = await Promise.all([
        discussionService.getAll(),
        userService.getAll()
      ]);
      setDiscussions(discussionsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussion = async (discussionId) => {
    try {
      const response = await discussionService.getById(discussionId);
      setCurrentDiscussion(response.data);
    } catch (error) {
      console.error('Failed to fetch discussion:', error);
    }
  };

  const getAvailableReceivers = () => {
    if (user?.role === 'student') {
      return users.filter(u => u.role === 'teacher' || u.role === 'admin');
    } else if (user?.role === 'teacher') {
      return users.filter(u => u.role === 'admin');
    }
    return [];
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    try {
      await discussionService.create(formData);
      setShowCreateModal(false);
      setFormData({
        receiverId: '',
        subject: '',
        message: ''
      });
      fetchData();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentDiscussion) return;

    try {
      await discussionService.sendMessage(currentDiscussion._id, message);
      setMessage('');
      fetchDiscussion(currentDiscussion._id);
      fetchData();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If viewing a specific discussion
  if (id && currentDiscussion) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/discussions')}
            className="btn-secondary"
          >
            ← Retour
          </button>
          <h1 className="section-header mb-0">
            {currentDiscussion.subject}
          </h1>
        </div>

        <div className="card mb-6">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">De:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentDiscussion.sender.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">À:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentDiscussion.receiver.name}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {currentDiscussion.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md p-4 rounded-lg ${
                    msg.sender._id === user._id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-xs mb-1 opacity-75">
                    {msg.sender.name} • {new Date(msg.createdAt).toLocaleString('fr-FR')}
                  </p>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Send Message */}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tapez votre message..."
              className="input-field flex-1"
            />
            <button
              onClick={handleSendMessage}
              className="btn-primary"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Discussions list view
  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="section-header mb-0">
          Discussions
        </h1>
        {getAvailableReceivers().length > 0 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + Nouvelle Discussion
          </button>
        )}
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aucune discussion
            </p>
            {getAvailableReceivers().length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Créer une Discussion
              </button>
            )}
          </div>
        ) : (
          discussions.map((discussion) => {
            const otherUser = discussion.sender._id === user._id
              ? discussion.receiver
              : discussion.sender;
            const unreadCount = discussion.messages.filter(
              msg => msg.sender._id !== user._id && !msg.read
            ).length;

            return (
              <div
                key={discussion._id}
                onClick={() => navigate(`/discussions/${discussion._id}`)}
                className="card cursor-pointer hover:border-purple-500 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {discussion.subject}
                      </h3>
                      {unreadCount > 0 && (
                        <span className="badge-primary">
                          {unreadCount} nouveau(x)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Avec: {otherUser.name}
                    </p>
                    {discussion.messages.length > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Dernier message: {new Date(discussion.lastMessageAt).toLocaleString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <span className="text-2xl">→</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Discussion Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="section-subheader mb-0">
                  Nouvelle Discussion
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDiscussion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Destinataire *</label>
                  <select
                    value={formData.receiverId}
                    onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Sélectionner un destinataire</option>
                    {getAvailableReceivers().map(receiver => (
                      <option key={receiver._id} value={receiver._id}>
                        {receiver.name} ({receiver.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sujet *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-field"
                    rows="4"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn-primary">
                    Envoyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discussions;

