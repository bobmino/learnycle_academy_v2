import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { approvalService } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import BackButton from '../components/BackButton';

/**
 * Approvals Page
 * Manage module approval requests
 */
const Approvals = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (user?.role === 'student') {
      fetchMyApprovals();
    } else {
      fetchPendingApprovals();
    }
  }, [filter, user]);

  const fetchPendingApprovals = async () => {
    try {
      const response = await approvalService.getPending();
      let filtered = response.data;
      if (filter !== 'pending') {
        // For teacher/admin, we need to fetch all approvals and filter
        // This is a simplified version - in production, you'd add a filter endpoint
        filtered = filtered.filter(a => {
          if (filter === 'all') return true;
          return a.status === filter;
        });
      }
      setApprovals(filtered);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApprovals = async () => {
    try {
      const response = await approvalService.getMy();
      let filtered = response.data;
      if (filter !== 'all') {
        filtered = filtered.filter(a => a.status === filter);
      }
      setApprovals(filtered);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId) => {
    try {
      await approvalService.approve(approvalId, comment);
      setComment('');
      if (user?.role === 'student') {
        fetchMyApprovals();
      } else {
        fetchPendingApprovals();
      }
      alert('Approbation accordée');
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (approvalId) => {
    if (!comment.trim()) {
      alert('Veuillez ajouter un commentaire pour expliquer le rejet');
      return;
    }
    try {
      await approvalService.reject(approvalId, comment);
      setComment('');
      if (user?.role === 'student') {
        fetchMyApprovals();
      } else {
        fetchPendingApprovals();
      }
      alert('Demande rejetée');
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

  return (
    <div className="container-custom py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: user?.role === 'student' ? 'Mes Demandes' : 'Approbations' }
        ]}
      />

      <div className="flex items-center gap-4 mb-8">
        <BackButton to="/dashboard" />
        <h1 className="section-header mb-0">
          {user?.role === 'student' ? 'Mes Demandes d\'Approbation' : 'Gestion des Approbations'}
        </h1>
      </div>

      {/* Filters (for teacher/admin) */}
      {user?.role !== 'student' && (
        <div className="card mb-6">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Filtre</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field"
              >
                <option value="pending">En attente</option>
                <option value="approved">Approuvées</option>
                <option value="rejected">Rejetées</option>
                <option value="all">Toutes</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Student View */}
      {user?.role === 'student' && (
        <div className="card mb-6">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Filtre</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">Toutes</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvées</option>
                <option value="rejected">Rejetées</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {user?.role === 'student' 
                ? 'Aucune demande d\'approbation'
                : 'Aucune demande en attente'}
            </p>
          </div>
        ) : (
          approvals.map((approval) => (
            <div key={approval._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {approval.module.title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      approval.status === 'approved' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : approval.status === 'rejected'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {approval.status === 'approved' ? 'Approuvé' :
                       approval.status === 'rejected' ? 'Rejeté' : 'En attente'}
                    </span>
                  </div>
                  {user?.role !== 'student' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Demandé par: {approval.user.name} ({approval.user.email})
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Demandé le: {new Date(approval.requestedAt).toLocaleString('fr-FR')}
                  </p>
                  {approval.approvedAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {approval.status === 'approved' ? 'Approuvé' : 'Rejeté'} le: {new Date(approval.approvedAt).toLocaleString('fr-FR')}
                    </p>
                  )}
                  {approval.comment && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {approval.comment}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions for Teacher/Admin */}
              {user?.role !== 'student' && approval.status === 'pending' && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Commentaire (optionnel)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="input-field"
                      rows="2"
                      placeholder="Ajouter un commentaire..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(approval._id)}
                      className="btn-primary flex-1"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(approval._id)}
                      className="btn-secondary flex-1"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              )}

              {/* View Module Link */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={`/modules/${approval.module._id}`}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Voir le module →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Approvals;

