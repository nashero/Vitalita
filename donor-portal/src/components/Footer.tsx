import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer" aria-label="Footer">
      <nav aria-label="Footer links">
        <ul className="footer-links">
          <li>
            <Link to="/help">Help</Link>
          </li>
          <li>
            <a href="https://www.vitalita.com/privacy" target="_blank" rel="noreferrer">
              Privacy
            </a>
          </li>
          <li>
            <a href="https://www.vitalita.com/contact" target="_blank" rel="noreferrer">
              Contact
            </a>
          </li>
        </ul>
      </nav>
      <a className="footer-home" href="https://www.vitalita.com" target="_blank" rel="noreferrer">
        Back to Vitalita.org
      </a>
    </footer>
  );
}

export default Footer;

