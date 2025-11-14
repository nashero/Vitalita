import { Link } from 'react-router-dom';
import FirstImage from '../images/First.jpg';
import SecondImage from '../images/Second.jpg';
import ThirdImage from '../images/Third.jpg';

function HeroSection() {
  return (
    <section className="hero" id="book">
      <div className="hero-content">
        <h1>
          Schedule Your Donation, <span className="highlight-red">Save Lives</span>
        </h1>
        <p>Book your blood or plasma donation online in minutes. Join thousands of donors making a difference every day.</p>
        
        <div className="hero-images">
          <img src={FirstImage} alt="Medical professionals transporting a patient" className="hero-image" />
          <img src={SecondImage} alt="Healthcare professional comforting a patient" className="hero-image" />
          <img src={ThirdImage} alt="Medical team celebrating with a young patient" className="hero-image" />
        </div>

        <div className="donor-registration-section">
          <h2>Donor Registration & Login</h2>
          <p className="registration-description">
            New to Vitalita? Register as a donor or login to your existing account to manage appointments.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/register">
              <span className="button-icon">👤</span>
              First Time Donating?
            </Link>
            <Link className="button secondary login-button" to="/login">
              <span className="button-icon">🔑</span>
              Book your appointment Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

