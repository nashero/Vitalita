import { Link } from 'react-router-dom';

function HelpSection() {
  return (
    <section className="help" id="help" aria-labelledby="help-title">
      <div className="help-card">
        <h2 id="help-title">Need Help?</h2>
        <p>We are happy to guide you. Choose the best way to reach us.</p>
        <div className="help-actions">
          <Link className="button primary" to="/help">
            View Common Questions
          </Link>
          <a className="button secondary" href="tel:+391800123456">
            Call Us
          </a>
        </div>
        <p className="help-note">Support hours: 8 AM – 8 PM, every day.</p>
      </div>
    </section>
  );
}

export default HelpSection;

