import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { projectService } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import BackButton from '../components/BackButton';
import GradeDisplay from '../components/GradeDisplay';

/**
 * Project Detail Page
 * View and submit projects
 */
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    files: [],
    comment: ''
  });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectService.getById(id);
      setProject(response.data);
      setSubmission(response.data.submission || null);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.files.length === 0 && !formData.comment) {
      alert('Veuillez ajouter au moins un fichier ou un commentaire');
      return;
    }

    setSubmitting(true);
    try {
      // In a real app, you'd upload files first, then submit with file paths
      // For now, we'll just submit with file names
      const fileData = formData.files.map(file => ({
        filename: file.name,
        path: `/tmp/uploads/projects/${file.name}` // This would be the actual uploaded path
      }));

      await projectService.submit(id, {
        files: fileData,
        comment: formData.comment
      });
      alert('Projet soumis avec succès');
      fetchProject();
      setFormData({ files: [], comment: '' });
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projet non trouvé</h1>
      </div>
    );
  }

  const getProjectIcon = (type) => {
    const icons = {
      'project': '📋',
      'case-study': '📊',
      'exam': '📝'
    };
    return icons[type] || '📋';
  };

  return (
    <div className="container-custom py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Projets', to: '/projects' },
          { label: project.name }
        ]}
      />

      <div className="flex items-center gap-4 mb-6">
        <BackButton to="/projects" />
        <div className="flex items-center gap-3">
          <span className="text-4xl">{getProjectIcon(project.type)}</span>
          <h1 className="section-header mb-0">
            {project.name}
          </h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Info */}
          <div className="card">
            <h2 className="section-subheader mb-4">Description</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {project.description}
            </p>
            {project.instructions && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instructions</h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {project.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Deliverables */}
          {project.deliverables && project.deliverables.length > 0 && (
            <div className="card">
              <h2 className="section-subheader mb-4">Livrables Requis</h2>
              <ul className="space-y-2">
                {project.deliverables.map((deliverable, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {deliverable.name}
                      </span>
                      {deliverable.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {deliverable.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submission Form (Student) */}
          {user?.role === 'student' && (
            <div className="card">
              <h2 className="section-subheader mb-4">
                {submission ? 'Modifier la Soumission' : 'Soumettre le Projet'}
              </h2>
              {submission && submission.status === 'approved' && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-800 dark:text-green-300 font-medium">
                    ✓ Projet approuvé
                  </p>
                </div>
              )}
              {submission && submission.status === 'needs-revision' && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-300 font-medium mb-2">
                    ⚠ Révision requise
                  </p>
                  {submission.revisionNotes && (
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      {submission.revisionNotes}
                    </p>
                  )}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fichiers</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="input-field"
                  />
                  {formData.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 dark:text-red-400 hover:underline text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Commentaire (optionnel)</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="input-field"
                    rows="4"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Envoi...' : submission ? 'Mettre à jour' : 'Soumettre'}
                </button>
              </form>
            </div>
          )}

          {/* Submission Display (Student) */}
          {user?.role === 'student' && submission && (
            <div className="card">
              <h2 className="section-subheader mb-4">Ma Soumission</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Statut:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                    submission.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                    submission.status === 'needs-revision' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                    submission.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}>
                    {submission.status}
                  </span>
                </div>
                {submission.grade !== null && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Note:</span>
                    <div className="mt-1">
                      <GradeDisplay grade={submission.grade} />
                    </div>
                  </div>
                )}
                {submission.comment && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Commentaire:</span>
                    <p className="mt-1 text-gray-900 dark:text-white">{submission.comment}</p>
                  </div>
                )}
                {submission.submittedAt && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Soumis le:</span>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {new Date(submission.submittedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submissions List (Teacher/Admin) */}
          {(user?.role === 'teacher' || user?.role === 'admin') && project.submissions && (
            <div className="card">
              <h2 className="section-subheader mb-4">Soumissions</h2>
              {project.submissions.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">Aucune soumission</p>
              ) : (
                <div className="space-y-4">
                  {project.submissions.map((sub) => (
                    <div key={sub._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {sub.student.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sub.student.email}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          sub.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' :
                          sub.status === 'needs-revision' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-700'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      {sub.grade !== null && (
                        <div className="mb-2">
                          <GradeDisplay grade={sub.grade} />
                        </div>
                      )}
                      {sub.comment && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {sub.comment}
                        </p>
                      )}
                      <Link
                        to={`/grading?project=${project._id}&student=${sub.student._id}`}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Noter
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Informations
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {project.type}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Module:</span>
                <Link
                  to={`/modules/${project.module._id}`}
                  className="font-medium text-purple-600 dark:text-purple-400 hover:underline block"
                >
                  {project.module.title}
                </Link>
              </div>
              {project.group && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Groupe:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {project.group.name}
                  </p>
                </div>
              )}
              {project.dueDate && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Date limite:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(project.dueDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

