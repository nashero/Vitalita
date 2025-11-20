import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../assets/images/vitalita_logo_heart.svg';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'How We Simplify', path: '/how-we-simplify' },
  { label: 'Features', path: '/features' },
  { label: 'Case Studies', path: '/case-studies' },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

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
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            to="/contact"
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/40 transition hover:bg-red-700 hover:shadow-red-600/50"
          >
            Talk to us!
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-700 transition hover:border-red-200 hover:text-red-600 lg:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <nav className="section-container flex flex-col space-y-2 py-4 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-4 py-2 transition-colors',
                    isActive ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="rounded-lg bg-red-600 px-4 py-2 text-center text-white shadow-md shadow-red-600/30 transition hover:bg-red-700"
            >
              Talk to us!
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

