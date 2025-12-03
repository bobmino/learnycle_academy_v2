import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { profileService } from '../services/api';
import ProgressBar from '../components/ProgressBar';

/**
 * Profile Page
 * User profile management
 */
const Profile = () => {
  const { t } = useTranslation();
  const { user: authUser } = useSelector((state) => state.auth);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    moduleDisplayMode: 'list',
    notificationSettings: {
      email: true,
      push: true
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileService.getMy();
      setUser(response.data);
      setFormData({
        name: response.data.name,
        bio: response.data.bio || '',
        moduleDisplayMode: response.data.preferences?.moduleDisplayMode || 'list',
        notificationSettings: response.data.preferences?.notificationSettings || {
          email: true,
          push: true
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [name]: checked
      }
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await profileService.update({
        name: formData.name,
        bio: formData.bio
      });
      await profileService.updatePreferences({
        moduleDisplayMode: formData.moduleDisplayMode,
        notificationSettings: formData.notificationSettings
      });
      setMessage('Profil mis à jour avec succès');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      setMessage('Erreur lors de la mise à jour: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    
    try {
      await profileService.uploadAvatar(avatarFile);
      setMessage('Avatar mis à jour avec succès');
      setAvatarFile(null);
      setAvatarPreview(null);
      fetchProfile();
    } catch (error) {
      setMessage('Erreur lors de l\'upload: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage('Mot de passe modifié avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
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
    <div className="container-custom py-8">
      <h1 className="section-header mb-8">Mon Profil</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('succès') 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="card">
          <h2 className="section-subheader mb-4">Photo de profil</h2>
          <div className="flex flex-col items-center">
            {getAvatarUrl() ? (
              <img
                src={getAvatarUrl()}
                alt={user?.name}
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-purple-600 text-white flex items-center justify-center text-3xl font-semibold mb-4">
                {getInitials()}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="mb-2 text-sm"
            />
            {avatarFile && (
              <button
                onClick={handleUploadAvatar}
                className="btn-primary text-sm"
              >
                Uploader
              </button>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="md:col-span-2">
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="section-subheader">Informations personnelles</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-outline"
                >
                  Modifier
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    className="input-field bg-gray-100 dark:bg-gray-700"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="input-field"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mode d'affichage des modules</label>
                  <select
                    name="moduleDisplayMode"
                    value={formData.moduleDisplayMode}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="list">Tous les modules (liste)</option>
                    <option value="assigned">Modules assignés uniquement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Paramètres de notifications</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="email"
                        checked={formData.notificationSettings.email}
                        onChange={handlePreferenceChange}
                        className="rounded"
                      />
                      <span>Notifications par email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="push"
                        checked={formData.notificationSettings.push}
                        onChange={handlePreferenceChange}
                        className="rounded"
                      />
                      <span>Notifications push</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Nom:</span>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                  <p className="font-medium">{user?.email}</p>
                </div>
                {user?.bio && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bio:</span>
                    <p className="font-medium">{user.bio}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rôle:</span>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mode d'affichage:</span>
                  <p className="font-medium">
                    {formData.moduleDisplayMode === 'list' ? 'Tous les modules' : 'Modules assignés'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="card">
            <h2 className="section-subheader mb-4">Changer le mot de passe</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-primary">
                Changer le mot de passe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

