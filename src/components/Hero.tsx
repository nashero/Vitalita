import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronDown, ChevronUp, Clock, Heart, TrendingDown, Users, XCircle } from 'lucide-react';
import circularInfographic from '../assets/images/Circular Infographic.jpg';

const Hero = () => {
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);

  return (
    <section className="section-container relative overflow-hidden py-20">
      <div className="absolute left-1/2 top-0 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-red-500/10 blur-[120px]" />
      
      {/* Main Impact Message */}
      <div className="mx-auto max-w-4xl text-center mb-16">
        <div className="inline-flex items-center space-x-2 rounded-full border border-red-200 bg-red-50/90 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-700 shadow-sm shadow-red-100 mb-6">
          <AlertTriangle className="h-4 w-4" />
          <span>The Cost of Inefficiency</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6">
          <span className="text-red-600"> Every Life Matters. </span>
           <span className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6">Every Second Counts. </span>
        </h1>
        <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-700 font-medium">
          Without Vitalita, you lose time—and time is life.
        </p>
      </div>

      {/* Circular Infographic */}
      <div className="mb-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center">
            <img 
              src={circularInfographic} 
              alt="Vitalita Revolutionizing Blood Donation - Circular Infographic" 
              className="max-w-2xl w-full h-auto rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* The Story Section */}
      <div className="mb-16">
        <div className="mx-auto max-w-5xl">
          <div 
            className="rounded-3xl border-2 border-red-100 bg-gradient-to-br from-red-50/50 via-white to-slate-50 p-8 md:p-12 shadow-xl cursor-pointer transition-all duration-300 hover:border-red-200 hover:shadow-2xl"
            onClick={() => setIsStoryExpanded(!isStoryExpanded)}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 flex-shrink-0">
                <Heart className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Our Mission, Our Story</h2>
                <p className="text-sm text-slate-600">Click to read the story that inspired our mission</p>
              </div>
              <div className="flex-shrink-0">
                {isStoryExpanded ? (
                  <ChevronUp className="h-6 w-6 text-slate-600" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-slate-600" />
                )}
              </div>
            </div>
            
            {isStoryExpanded && (
              <div className="space-y-6 text-slate-700 transition-all duration-300 ease-in-out">
                <div className="pt-4 border-t border-red-100">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">A Story That Should Never Happen</h3>
                  <p className="text-sm text-slate-600 mb-6">Real impact of disconnected systems</p>
                </div>
                <p className="text-lg leading-relaxed">
                  <span className="font-semibold text-slate-900">Maria, a 34-year-old mother of two,</span> was rushed to the emergency room after a severe accident. Her blood type—O negative—was critical and in urgent demand.
                </p>
                <p className="text-lg leading-relaxed">
                  The hospital contacted the regional blood bank. A coordinator manually checked three separate spreadsheets, made six phone calls, and spent <span className="font-semibold text-red-600">47 minutes</span> trying to locate available O-negative units.
                </p>
                <p className="text-lg leading-relaxed">
                  Meanwhile, three O-negative donors had been scheduled for donation that same day—but due to double-booking in a paper-based system, two never showed up. The third was at a mobile unit across town, but the coordinator couldn't verify availability in real-time.
                </p>
                <div className="rounded-2xl bg-red-100/50 border border-red-200 p-6 my-8">
                  <p className="text-xl font-semibold text-red-900 text-center">
                    Maria didn't receive the blood transfusion in time.
                  </p>
                  <p className="text-center text-red-700 mt-2">
                    Her family later learned that compatible blood was available—just 12 kilometers away.
                  </p>
                </div>
                <p className="text-lg leading-relaxed font-medium text-slate-900">
                  This tragedy wasn't caused by a shortage of blood or willing donors. It was caused by <span className="text-red-600">inefficient systems, manual coordination, and disconnected data.</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* What You're Losing Section */}
      <div className="mb-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold text-center text-slate-900 mb-12">
            What Your Organization Loses Without Vitalita
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <XCircle className="h-6 w-6 text-red-600" />,
                title: 'Lives at Risk',
                description: 'Delayed responses cost precious minutes when every second counts',
                stat: 'Avg. 2.3 hours to locate critical blood',
              },
              {
                icon: <Users className="h-6 w-6 text-red-600" />,
                title: 'Donor Attrition',
                description: 'Poor coordination leads to no-shows and lost trust',
                stat: '22% of donors never return',
              },
              {
                icon: <Clock className="h-6 w-6 text-red-600" />,
                title: 'Operational Waste',
                description: 'Manual processes consume staff time and resources',
                stat: '40+ hours/week on coordination',
              },
              {
                icon: <TrendingDown className="h-6 w-6 text-red-600" />,
                title: 'Capacity Loss',
                description: 'Double bookings and gaps reduce collection efficiency',
                stat: '31% of slots underutilized',
              },
            ].map((loss) => (
              <div
                key={loss.title}
                className="rounded-2xl border-2 border-red-100 bg-white p-6 shadow-lg transition duration-300 hover:-translate-y-2 hover:border-red-300 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
                  {loss.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{loss.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 mb-4">{loss.description}</p>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">{loss.stat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xl font-semibold text-slate-900 mb-4">
          Don't let another life be lost to inefficient systems.
        </p>
        <p className="text-lg text-slate-600 mb-8">
          Vitalita ensures that when someone like Maria needs blood, it's found and delivered in minutes—not hours.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-red-600/40 transition hover:bg-red-700 hover:shadow-red-600/50"
          >
            Schedule a Demo
          </Link>
          <Link
            to="/how-it-works"
            className="inline-flex items-center justify-center rounded-full border-2 border-slate-300 px-8 py-4 text-base font-semibold text-slate-700 transition hover:border-red-400 hover:text-red-600"
          >
            See How It Works
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;

