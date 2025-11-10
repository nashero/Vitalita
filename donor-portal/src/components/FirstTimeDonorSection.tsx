const facts = [
  'Check-in is friendly and quick.',
  'You can bring a friend or family member.',
  'Snacks and water are waiting after you donate.'
];

const eligibility = [
  'You feel healthy today.',
  'You are at least 16 (with consent) or 17+.',
  'You weigh 110 pounds or more.'
];

function FirstTimeDonorSection() {
  return (
    <section className="first-time" id="first-time" aria-labelledby="first-time-title">
      <div className="card">
        <h2 id="first-time-title">New to Donating?</h2>
        <p className="card-intro">We will guide you every step of the way.</p>
        <div className="card-content">
          <div>
            <h3>What Happens</h3>
            <ul className="simple-list">
              {facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Who Can Donate</h3>
            <ul className="simple-list">
              {eligibility.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <a className="button secondary card-button" href="/help">
          Learn More
        </a>
      </div>
    </section>
  );
}

export default FirstTimeDonorSection;

