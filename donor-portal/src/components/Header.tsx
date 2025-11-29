import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { logout, isAuthenticated as checkAuth } from '../utils/auth';

const navItems = [
  { labelKey: 'navigation.home', to: '/' },
  { labelKey: 'navigation.bookAppointment', to: '/book' },
  { labelKey: 'navigation.myAppointments', to: '/appointments' },
  { labelKey: 'navigation.help', to: '/help' },
];

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('donor_hash_id');
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Check authentication status and listen for changes
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!sessionStorage.getItem('donor_hash_id'));
    };

    // Check on mount and when location changes
    checkAuth();

    // Listen for storage events (when login/logout happens in another tab/window)
    window.addEventListener('storage', checkAuth);

    // Listen for custom events (when login/logout happens in same tab)
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, [location]);

  // Filter navigation items based on context
  const getNavItems = () => {
    return navItems.filter((item) => {
      // Hide "Home" on homepage
      if (item.to === '/' && location.pathname === '/') {
        return false;
      }
      return true;
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  // Handle navigation with authentication check
  const handleNavClick = (to: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    // Check if the route requires authentication
    if ((to === '/book' || to === '/appointments') && !checkAuth()) {
      e.preventDefault();
      closeMenu();
      navigate('/login');
      return;
    }
    closeMenu();
  };

  return (
    <header
      className={`header ${isSticky ? 'sticky' : ''}`}
      aria-label="Top navigation"
    >
      <div className="header-container">
        <a
          className="logo-link"
          href="https://www.vitalita.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Vitalita home"
        >
          <span aria-hidden="true" className="logo-mark">
            ❤️
          </span>
          <span className="logo-text">Vitalita</span>
        </a>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={t('navigation.toggleMenu')}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={toggleMenu}
        >
          <span className="hamburger-icon" aria-hidden="true">
            <span className={isMenuOpen ? 'open' : ''}></span>
            <span className={isMenuOpen ? 'open' : ''}></span>
            <span className={isMenuOpen ? 'open' : ''}></span>
          </span>
          <span className="sr-only">
            {isMenuOpen ? t('navigation.closeMenu') : t('navigation.openMenu')}
          </span>
        </button>

        <nav
          id="primary-navigation"
          className={`nav ${isMenuOpen ? 'nav-open' : ''}`}
          aria-label="Primary"
        >
          <ul className="nav-list">
            {getNavItems().map((item) => (
              <li key={item.labelKey}>
                <Link
                  className="nav-link"
                  to={item.to}
                  onClick={(e) => handleNavClick(item.to, e)}
                  aria-current={location.pathname === item.to ? 'page' : undefined}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="compact" />
            {isAuthenticated ? (
              <button
                type="button"
                className="login-button"
                onClick={handleLogout}
                aria-label={t('navigation.logOut')}
              >
                <span aria-hidden="true" className="icon-circle" role="presentation">
                  🚪
                </span>
                <span>{t('navigation.logOut')}</span>
              </button>
            ) : (
              <Link
                className="login-button"
                to="/login"
                onClick={closeMenu}
                aria-label={t('navigation.logIn')}
              >
                <span aria-hidden="true" className="icon-circle" role="presentation">
                  👤
                </span>
                <span>{t('navigation.logIn')}</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;

