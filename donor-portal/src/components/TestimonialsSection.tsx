const testimonials = [
  {
    quote: '“I booked my visit in one minute. Staff made me feel calm and welcome.”',
    name: 'Sara, first-time donor'
  },
  {
    quote: '“Giving blood is my simple way to help neighbors in need.”',
    name: 'Miguel, monthly donor'
  },
  {
    quote: '“The reminders are so helpful. I never miss my appointments now.”',
    name: 'Priya, repeat donor'
  }
];

function TestimonialsSection() {
  return (
    <section className="testimonials" aria-labelledby="testimonials-title">
      <h2 id="testimonials-title">Donors Share Their Experience</h2>
      <div className="testimonial-grid">
        {testimonials.map((item) => (
          <figure key={item.name} className="testimonial-card">
            <blockquote>{item.quote}</blockquote>
            <figcaption>{item.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default TestimonialsSection;

