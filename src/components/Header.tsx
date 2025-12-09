import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/vitalita_logo_heart.svg';
import LanguageSwitcher from './LanguageSwitcher';

const navItems = [
  { labelKey: 'navigation.home', path: '/' },
  { labelKey: 'navigation.howItWorks', path: '/how-it-works' },
  { labelKey: 'navigation.simplicityDelivered', path: '/how-we-simplify' },
  { labelKey: 'navigation.features', path: '/features' },
  { labelKey: 'navigation.caseStudies', path: '/case-studies' },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="section-container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center space-x-2 text-lg font-semibold tracking-tight text-slate-900">
          <img
            src={logo}
            alt="Vitalita logo"
            className="h-12 object-contain"
          />
        </Link>

        <nav className="hidden items-center space-x-8 text-sm font-medium text-slate-600 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  'transition-colors duration-200 hover:text-red-600',
                  isActive ? 'text-red-600' : 'text-slate-600',
                ].join(' ')
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center space-x-4">
          <LanguageSwitcher variant="compact" />
          <Link
            to="/contact"
            className="rounded-full bg-[#FF6B6B] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#FF6B6B]/40 transition hover:bg-[#E65A5A] hover:shadow-[#FF6B6B]/50"
          >
            {t('navigation.talkToUs')}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-700 transition hover:border-red-200 hover:text-red-600 lg:hidden min-w-[44px] min-h-[44px]"
          aria-label={t('navigation.toggleNavigation')}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden mt-16">
          <nav className="flex flex-col space-y-2 py-6 px-5 text-lg font-medium h-full overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-4 py-3 transition-colors min-h-[44px] flex items-center',
                    isActive ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50',
                  ].join(' ')
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
            <div className="px-4 py-2">
              <LanguageSwitcher variant="compact" />
            </div>
            <Link
              to="/contact"
              className="rounded-lg bg-[#FF6B6B] px-4 py-3 text-center text-white shadow-md shadow-[#FF6B6B]/30 transition hover:bg-[#E65A5A] min-h-[44px] flex items-center justify-center"
            >
              {t('navigation.talkToUs')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

