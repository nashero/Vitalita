import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, LayoutDashboard } from 'lucide-react';
import { isAuthenticated } from '../utils/auth';
import FirstImage from '../images/First.jpg';
import SecondImage from '../images/Second.jpg';
import ThirdImage from '../images/Third.jpg';

function HeroSection() {
  const { t } = useTranslation();
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());

  useEffect(() => {
    const checkAuth = () => {
      setAuthenticated(isAuthenticated());
    };

    // Check on mount
    checkAuth();

    // Listen for auth changes (when login/logout happens)
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  
  return (
    <section className="hero" id="book">
      <div className="hero-content">
        <h1>
          {t('hero.title')}<span className="highlight-red">{t('hero.titleHighlight')}</span>
        </h1>
        <p>{t('hero.description')}</p>
        
        <div className="hero-images">
          <img src={FirstImage} alt={t('hero.imageAlt1')} className="hero-image" />
          <img src={SecondImage} alt={t('hero.imageAlt2')} className="hero-image" />
          <img src={ThirdImage} alt={t('hero.imageAlt3')} className="hero-image" />
        </div>

        <div className="donor-registration-section">
          <h2>{t('hero.donorRegistrationTitle')}</h2>
          <p className="registration-description">
            {t('hero.donorRegistrationDescription')}
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/register">
              <span className="button-icon">👤</span>
              {t('hero.firstTimeDonating')}
            </Link>
            <Link 
              className="button secondary login-button" 
              to={authenticated ? "/appointments" : "/login"}
            >
              {authenticated ? (
                <LayoutDashboard className="button-icon" size={18} />
              ) : (
                <LogIn className="button-icon" size={18} />
              )}
              {authenticated ? t('hero.viewDashboard') : t('hero.bookAppointmentNow')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

