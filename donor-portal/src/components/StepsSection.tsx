const steps = [
  {
    number: 1,
    title: 'Choose Your Center',
    text: 'Find a location near you',
    icon: '📍'
  },
  {
    number: 2,
    title: 'Pick a Time',
    text: 'Select a day and time that works for you',
    icon: '🗓️'
  },
  {
    number: 3,
    title: 'Confirm',
    text: "You'll get a reminder before your appointment",
    icon: '✅'
  },
  {
    number: 4,
    title: 'Donate',
    text: 'Each donation can help up to 3 people',
    icon: '❤️'
  }
];

function StepsSection() {
  return (
    <section className="steps" aria-labelledby="steps-title">
      <h2 id="steps-title">Your 4 Easy Steps</h2>
      <ol className="steps-list">
        {steps.map((step) => (
          <li key={step.number} className="step-card">
            <span className="step-icon" aria-hidden="true">
              {step.icon}
            </span>
            <div>
              <p className="step-title">
                {step.number}. {step.title}
              </p>
              <p className="step-text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default StepsSection;

