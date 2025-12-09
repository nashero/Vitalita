import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Facebook, Instagram, Twitter } from 'lucide-react';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-espresso text-white py-12 md:py-16 px-6" aria-label="Footer">
      <div className="max-w-[1200px] mx-auto">
        {/* Four Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Column 1: About Vitalita */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-terracotta" />
              <span className="text-xl font-bold">Vitalita</span>
            </div>
            <p className="text-cream mb-2">Born in Italy. Ready for Everyone.</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg" aria-label="Italian flag">
                🇮🇹
              </span>
              <span className="text-sm text-cream">AVIS Partnership</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/book"
                  className="text-cream hover:text-mediterranean-blue transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-1"
                >
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link
                  to="/appointments"
                  className="text-cream hover:text-mediterranean-blue transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-1"
                >
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-cream hover:text-mediterranean-blue transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-1"
                >
                  Help & FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/eligibility"
                  className="text-cream hover:text-mediterranean-blue transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-1"
                >
                  Eligibility Check
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/#how-it-works"
                  className="text-cream hover:text-mediterranean-blue transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-1"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/#testimonials"
                  className="text-cream hover:text-mediterranean-blue transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-1"
                >
                  Donor Stories
                </Link>
              </li>
              <li>
                <Link
                  to="/book"
                  className="text-cream hover:text-mediterranean-blue transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-1"
                >
                  Find a Center
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-cream hover:text-mediterranean-blue transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-1"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Legal & Contact</h3>
            <ul className="space-y-2 mb-4">
              <li>
                <a
                  href="https://www.vitalita.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cream hover:text-mediterranean-blue transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-1"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://www.vitalita.com/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cream hover:text-mediterranean-blue transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-1"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="https://www.vitalita.com/gdpr"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cream hover:text-mediterranean-blue transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-1"
                >
                  GDPR Information
                </a>
              </li>
            </ul>
            <div className="space-y-2 text-cream text-sm">
              <p>
                <a
                  href="mailto:donations@vitalita.com"
                  className="hover:text-mediterranean-blue transition-colors"
                >
                  donations@vitalita.com
                </a>
              </p>
              <p>
                <a
                  href="tel:+391800123456"
                  className="hover:text-mediterranean-blue transition-colors"
                >
                  +39 1800 123 456
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-taupe/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cream text-sm text-center md:text-left">
              © 2024 Vitalita. Developed in partnership with AVIS Italy.
            </p>
            <div className="flex items-center gap-6">
              {/* Social Media Icons */}
              <a
                href="https://www.facebook.com/vitalita"
                target="_blank"
                rel="noreferrer"
                className="text-mediterranean-blue hover:text-mediterranean-blue/80 transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/vitalita"
                target="_blank"
                rel="noreferrer"
                className="text-mediterranean-blue hover:text-mediterranean-blue/80 transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.twitter.com/vitalita"
                target="_blank"
                rel="noreferrer"
                className="text-mediterranean-blue hover:text-mediterranean-blue/80 transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.vitalita.com"
                target="_blank"
                rel="noreferrer"
                className="text-cream hover:text-mediterranean-blue transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50 rounded px-2"
              >
                Back to Vitalita.org
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
