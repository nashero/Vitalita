import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <section className="hero" id="book">
      <div className="hero-content">
        <h1>Book Your Blood Donation Appointment</h1>
        <p>Help save lives. Schedule your donation in just a few steps.</p>
        <div className="hero-actions">
          <Link className="button primary" to="/book">
            Book Appointment Now
          </Link>
          <a className="button secondary" href="#first-time">
            First Time Donating?
          </a>
        </div>
      </div>
      <div className="hero-illustration" role="presentation" aria-hidden="true">
        <div className="drop-icon">🩸</div>
        <p className="hero-note">Thank you for being a life saver.</p>
      </div>
    </section>
  );
}

export default HeroSection;

