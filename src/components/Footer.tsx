import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="section-container flex flex-col gap-6 py-8 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
              VT
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Vitalita</p>
              <p className="text-sm text-slate-500">Italian Blood Donation Management Platform</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            Purpose-built for AVIS, Croce Rossa Italiana, FIDAS, and FRATRES to orchestrate donor engagement, streamline
            scheduling, and give every coordinator a unified command center.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm text-slate-500 md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Product</p>
            <Link to="/features" className="block transition hover:text-red-600">
              Features
            </Link>
            <Link to="/how-it-works" className="block transition hover:text-red-600">
              How It Works
            </Link>
            <Link to="/pricing" className="block transition hover:text-red-600">
              Pricing
            </Link>
            <Link to="/case-studies" className="block transition hover:text-red-600">
              Case Studies
            </Link>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Company</p>
            <Link to="/contact" className="block transition hover:text-red-600">
              Contact
            </Link>
            <a href="mailto:partnerships@vitalita.it" className="block transition hover:text-red-600">
              Partnerships
            </a>
            <a href="#news" className="block transition hover:text-red-600">
              Newsroom
            </a>
            <a href="#careers" className="block transition hover:text-red-600">
              Careers
            </a>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Portals</p>
            <a href="#donor-portal" className="block transition hover:text-red-600">
              Donor Portal (Guest Access)
            </a>
            <a href="#coordinator-login" className="block transition hover:text-red-600">
              Coordinator Console
            </a>
            <a href="#api" className="block transition hover:text-red-600">
              Developer API
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50 py-4">
        <div className="section-container flex flex-col items-center justify-between gap-3 text-sm text-slate-500 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Vitalita. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="transition hover:text-red-600">
              Privacy Policy
            </a>
            <a href="#terms" className="transition hover:text-red-600">
              Terms of Service
            </a>
            <a href="#security" className="transition hover:text-red-600">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

