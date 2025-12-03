import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

/**
 * Navbar Component
 * Main navigation bar with auth status
 */
const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((state) => state.auth);

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
              <UserMenu />
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
