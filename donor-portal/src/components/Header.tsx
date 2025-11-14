import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Book Appointment', to: '/book' },
  { label: 'My Appointments', to: '/appointments' },
  { label: 'Help', to: '/help' },
];

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const location = useLocation();

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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
          aria-label="Toggle navigation menu"
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
            {isMenuOpen ? 'Close menu' : 'Open menu'}
          </span>
        </button>

        <nav
          id="primary-navigation"
          className={`nav ${isMenuOpen ? 'nav-open' : ''}`}
          aria-label="Primary"
        >
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  className="nav-link"
                  to={item.to}
                  onClick={closeMenu}
                  aria-current={location.pathname === item.to ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            className="login-button"
            to="/login"
            onClick={closeMenu}
            aria-label="Log in to view appointments"
          >
            <span aria-hidden="true" className="icon-circle" role="presentation">
              👤
            </span>
            <span>Log In</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;

