function AppointmentsSection() {
  return (
    <section className="appointments" id="appointments" aria-labelledby="appointments-title">
      <div className="appointments-card">
        <h2 id="appointments-title">My Appointments</h2>
        <p>Log in to see your upcoming visits, change times, or cancel.</p>
        <a className="button primary" href="/login">
          Log In to Continue
        </a>
        <p className="appointments-note">
          Need to make a change right away? Call us at 1-800-123-4567.
        </p>
      </div>
    </section>
  );
}

export default AppointmentsSection;

