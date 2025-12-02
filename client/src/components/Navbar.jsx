import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

/**
 * Navbar Component
 * Main navigation bar with auth status
 */
const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {t('app.title')}
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {t('nav.home')}
            </Link>
            
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('nav.dashboard')}
                </Link>
                <Link to="/modules" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('nav.modules')}
                </Link>
                <Link to="/teamwork" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('nav.teamwork')}
                </Link>
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300">
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
