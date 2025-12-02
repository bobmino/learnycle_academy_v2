import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { prospectService } from '../services/api';

/**
 * Prospect Form Page
 * Discovery form for potential students
 */
const ProspectForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    interests: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await prospectService.create(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {t('prospect.success')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="max-w-lg w-full">
        <div className="card">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            {t('prospect.title')}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                {t('prospect.fullName')} *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t('prospect.email')} *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="jean@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                {t('prospect.phone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div>
              <label htmlFor="interests" className="block text-sm font-medium mb-2">
                {t('prospect.interests')}
              </label>
              <textarea
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                rows="4"
                className="input-field"
                placeholder="Tell us what you'd like to learn..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? t('common.loading') : t('prospect.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProspectForm;
