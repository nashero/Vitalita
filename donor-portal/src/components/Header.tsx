import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { logout, isAuthenticated as checkAuth } from '../utils/auth';

interface NavItem {
  labelKey: string;
  to: string;
  isAnchor?: boolean;
}

const navItems: NavItem[] = [
  { labelKey: 'navigation.bookAppointment', to: '/book' },
  { labelKey: 'navigation.myAppointments', to: '/appointments' },
  { labelKey: 'navigation.help', to: '/help' },
  { labelKey: 'navigation.about', to: '/about' },
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
  const handleNavClick = (to: string, e: React.MouseEvent<HTMLAnchorElement>, isAnchor?: boolean) => {
    if (isAnchor && to.indexOf('#') === 0) {
      e.preventDefault();
      const element = document.querySelector(to);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      closeMenu();
      return;
    }
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
      className={`fixed top-0 left-0 right-0 bg-white shadow-md z-50 transition-shadow duration-300 ${
        isSticky ? 'shadow-lg' : 'shadow-sm'
      }`}
      aria-label="Top navigation"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo and AVIS Badge */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-espresso hover:text-mediterranean-blue transition-colors"
              aria-label="Vitalita home"
            >
              <Heart className="w-6 h-6 md:w-7 md:h-7 text-terracotta" />
              <span className="text-xl md:text-2xl font-bold">Vitalita</span>
            </Link>
            <div className="hidden sm:flex items-center px-2 py-1 bg-olive-green/10 border border-olive-green/30 rounded text-xs font-medium text-olive-green">
              AVIS
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav
            id="primary-navigation"
            className="hidden lg:flex items-center gap-6 flex-1 justify-center"
            aria-label="Primary"
          >
            <ul className="flex items-center gap-6">
              {getNavItems().map((item) => (
                <li key={item.labelKey}>
                  {item.isAnchor ? (
                    <a
                      href={item.to}
                      className="text-espresso hover:text-mediterranean-blue font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-2 py-1"
                      onClick={(e) => handleNavClick(item.to, e, true)}
                    >
                      {t(item.labelKey)}
                    </a>
                  ) : (
                    <Link
                      className="text-espresso hover:text-mediterranean-blue font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-2 py-1"
                      to={item.to}
                      onClick={(e) => handleNavClick(item.to, e)}
                      aria-current={location.pathname === item.to ? 'page' : undefined}
                    >
                      {t(item.labelKey)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side: Language Selector and Login */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden sm:block">
              <LanguageSwitcher variant="compact" />
            </div>
            {isAuthenticated ? (
              <button
                type="button"
                className="px-4 py-2 text-mediterranean-blue border-2 border-mediterranean-blue rounded-lg hover:bg-mediterranean-blue hover:text-white font-medium transition-all focus:outline-none focus:ring-4 focus:ring-mediterranean-blue focus:ring-opacity-50"
                onClick={handleLogout}
                aria-label={t('navigation.logOut')}
              >
                {t('navigation.logOut')}
              </button>
            ) : (
              <Link
                className="px-4 py-2 text-mediterranean-blue border-2 border-mediterranean-blue rounded-lg hover:bg-mediterranean-blue hover:text-white font-medium transition-all focus:outline-none focus:ring-4 focus:ring-mediterranean-blue focus:ring-opacity-50"
                to="/login"
                aria-label={t('navigation.logIn')}
              >
                {t('navigation.logIn')}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="lg:hidden p-2 text-espresso hover:text-mediterranean-blue transition-colors"
              aria-label={isMenuOpen ? t('navigation.closeMenu') : t('navigation.openMenu')}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={toggleMenu}
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                <span
                  className={`block h-0.5 w-6 bg-current transition-all ${
                    isMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-current transition-all ${
                    isMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-current transition-all ${
                    isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav
          id="mobile-navigation"
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col gap-2 py-4 border-t border-taupe/20">
            {getNavItems().map((item) => (
              <li key={item.labelKey}>
                {item.isAnchor ? (
                  <a
                    href={item.to}
                    className="block px-4 py-3 text-espresso hover:text-mediterranean-blue hover:bg-cream/50 font-medium transition-colors rounded-lg"
                    onClick={(e) => handleNavClick(item.to, e, true)}
                  >
                    {t(item.labelKey)}
                  </a>
                ) : (
                  <Link
                    className="block px-4 py-3 text-espresso hover:text-mediterranean-blue hover:bg-cream/50 font-medium transition-colors rounded-lg"
                    to={item.to}
                    onClick={(e) => handleNavClick(item.to, e)}
                    aria-current={location.pathname === item.to ? 'page' : undefined}
                  >
                    {t(item.labelKey)}
                  </Link>
                )}
              </li>
            ))}
            <li className="px-4 py-2">
              <LanguageSwitcher variant="compact" />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;

