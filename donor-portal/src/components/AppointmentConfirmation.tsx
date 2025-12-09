import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Droplet,
  Utensils,
  Moon,
  CreditCard,
  Users,
  Heart,
  X,
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';

interface AppointmentConfirmationProps {
  centerName: string;
  centerAddress: string;
  appointmentDate: Date | string;
  appointmentTime: string;
  donationType?: string;
  patientsHelped?: number;
}

const AppointmentConfirmation = ({
  centerName,
  centerAddress,
  appointmentDate,
  appointmentTime,
  donationType = 'Blood',
  patientsHelped = 3,
}: AppointmentConfirmationProps) => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [checkmarkAnimated, setCheckmarkAnimated] = useState(false);

  // Trigger confetti and checkmark animation on mount
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    // Dynamically import canvas-confetti
    import('canvas-confetti')
      .then((confetti) => {
        // Confetti animation with warm Mediterranean colors
        const duration = 2000;
        const end = Date.now() + duration;

        interval = setInterval(() => {
          if (Date.now() > end) {
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
            return;
          }

          const confettiFn = confetti.default || confetti;
          confettiFn({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#D97757', '#9CAF88', '#5B9BD5', '#98D8C8'],
          });
          confettiFn({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#D97757', '#9CAF88', '#5B9BD5', '#98D8C8'],
          });
        }, 25);
      })
      .catch((error) => {
        // Silently fail if canvas-confetti is not available
        console.warn('canvas-confetti could not be loaded:', error);
      });

    // Trigger checkmark animation
    setTimeout(() => setCheckmarkAnimated(true), 100);

    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  // Ensure appointmentDate is a Date object
  const dateObj = appointmentDate instanceof Date 
    ? appointmentDate 
    : new Date(appointmentDate);
  
  const formattedDate = format(dateObj, 'EEEE d MMMM');
  const formattedTime = appointmentTime;
  const fullLocation = `${centerName}, ${centerAddress}`;

  const handleAddToCalendar = () => {
    const start = new Date(appointmentDate);
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 45);

    const formattedStart = format(start, "yyyyMMdd'T'HHmmss");
    const formattedEnd = format(end, "yyyyMMdd'T'HHmmss");

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Vitalita//Donor Portal//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@vitalita.com`,
      `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTSTART:${formattedStart}`,
      `DTEND:${formattedEnd}`,
      `SUMMARY:Blood Donation Appointment - ${centerName}`,
      `LOCATION:${centerAddress}`,
      'DESCRIPTION:Thank you for booking with Vitalita. Please arrive 5 minutes early and remember to bring a valid ID.',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vitalita-appointment.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareMessage = `I just scheduled my blood donation with Vitalita. Join me in saving lives! 💉❤️ 🇮🇹`;

  const shareUrl = window.location.href;

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleWhatsAppShare = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareMessage + ' ' + shareUrl)}`,
      '_blank'
    );
  };

  const handleGetDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(centerAddress)}`,
      '_blank'
    );
  };

  return (
    <div className="bg-cream py-8 px-4 min-h-screen">
      <div className="max-w-[800px] mx-auto">
        {/* Navigation - Back to Dashboard (top left) */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/appointments')}
            className="border-2 border-taupe text-taupe px-6 py-3 rounded-lg font-semibold hover:bg-taupe hover:text-white transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Progress Indicator - All steps complete */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white bg-olive-green transition-all duration-300">
                  {step}
                </div>
                {step < 5 && (
                  <div className="flex-1 h-1 mx-2 bg-olive-green transition-all duration-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Success Indicator */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <CheckCircle
              className={`w-20 h-20 text-olive-green transition-all duration-500 ${
                checkmarkAnimated
                  ? 'scale-100'
                  : 'scale-0'
              }`}
              style={{
                animation: checkmarkAnimated
                  ? 'bounceIn 0.6s ease-out'
                  : 'none',
              }}
            />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] md:text-[36px] font-bold text-espresso mb-3">
            You're Scheduled to Save Lives 🎉
          </h1>
          <p className="text-[18px] text-taupe">
            You're all set. Here's everything you need to know.
          </p>
        </div>

        {/* Appointment Details Card */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden flex">
          <div className="w-2 bg-terracotta flex-shrink-0"></div>
          <div className="p-8 flex-1">
            <h2 className="text-xl font-bold text-espresso mb-6">
              Appointment details
            </h2>

            <div className="space-y-4 mb-6">
              {/* Date */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-mediterranean-blue flex-shrink-0" />
                <span className="text-base text-espresso font-medium">
                  {formattedDate}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-mediterranean-blue flex-shrink-0" />
                <span className="text-base text-espresso font-medium">
                  {formattedTime}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-mediterranean-blue flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-base text-espresso font-medium mb-2">
                    {fullLocation}
                  </p>
                  <button
                    onClick={handleGetDirections}
                    className="text-mediterranean-blue underline hover:text-terracotta transition-colors text-sm font-medium"
                  >
                    Get directions
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleAddToCalendar}
                className="w-full sm:flex-1 bg-terracotta text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>📅</span>
                Add to Calendar
              </button>
              <button
                onClick={handleShare}
                className="w-full sm:flex-1 border-2 border-mediterranean-blue text-mediterranean-blue px-6 py-3 rounded-lg font-semibold hover:bg-mediterranean-blue hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Your Impact
              </button>
            </div>
          </div>
        </div>

        {/* Impact Statement */}
        <div className="bg-cream border-l-4 border-olive-green p-6 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-terracotta flex-shrink-0 mt-1" />
            <div>
              <p className="text-base font-semibold text-espresso mb-2 leading-relaxed" style={{ lineHeight: '1.6' }}>
                This appointment will help up to {patientsHelped} patients survive.
              </p>
              <p className="text-base text-espresso leading-relaxed" style={{ lineHeight: '1.6' }}>
                Your donation could save someone's parent, child, or friend.
              </p>
            </div>
          </div>
        </div>

        {/* Preparation Section */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden flex">
          <div className="w-1 bg-mediterranean-blue flex-shrink-0"></div>
          <div className="p-8 flex-1">
            <h2 className="text-xl font-bold text-espresso mb-6">
              Before You Donate
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Droplet className="w-5 h-5 text-sky-blue flex-shrink-0 mt-0.5" />
                <span className="text-base text-taupe">
                  <span className="text-olive-green mr-2">✓</span>
                  Hydrate well (8-10 glasses of water)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Utensils className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                <span className="text-base text-taupe">
                  <span className="text-olive-green mr-2">✓</span>
                  Eat a healthy meal
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Moon className="w-5 h-5 text-mediterranean-blue flex-shrink-0 mt-0.5" />
                <span className="text-base text-taupe">
                  <span className="text-olive-green mr-2">✓</span>
                  Get good sleep the night before
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                <span className="text-base text-taupe">
                  <span className="text-olive-green mr-2">✓</span>
                  Bring your donor ID
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* What Happens Next Timeline */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-8">
          <h2 className="text-xl font-bold text-espresso mb-6">
            What Happens Next
          </h2>
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-mediterranean-blue"></div>

            {/* Timeline items */}
            <div className="relative mb-6">
              <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-olive-green border-2 border-white"></div>
              <div className="pl-6">
                <p className="text-base text-espresso font-medium">
                  1 day before: We'll send you a reminder
                </p>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-olive-green border-2 border-white"></div>
              <div className="pl-6">
                <p className="text-base text-espresso font-medium">
                  Day of: Arrive 5 minutes early
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-olive-green border-2 border-white"></div>
              <div className="pl-6">
                <p className="text-base text-espresso font-medium">
                  After donation: Track your impact in your dashboard
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Message */}
        <div className="bg-cream border-l-4 border-olive-green p-6 rounded-lg mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-olive-green flex-shrink-0" />
            <p className="text-base text-espresso font-medium">
              You're joining 50,000+ donors in Italy
            </p>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="text-center mb-8">
          <p className="text-base text-espresso mb-3">Need to make changes?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/book')}
              className="text-mediterranean-blue hover:underline font-medium transition-colors"
            >
              Reschedule
            </button>
            <span className="text-taupe">|</span>
            <button
              onClick={() => navigate('/appointments')}
              className="text-mediterranean-blue hover:underline font-medium transition-colors"
            >
              Cancel Appointment
            </button>
          </div>
        </div>

        {/* Done Button - Bottom Center */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => navigate('/appointments')}
            className="bg-terracotta text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200"
          >
            Done
          </button>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-cream rounded-xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 text-espresso hover:text-terracotta transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-espresso mb-4">
                Share Your Impact
              </h3>

              <div className="bg-white p-4 rounded-lg mb-6 border border-taupe">
                <p className="text-base text-espresso">{shareMessage}</p>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={handleFacebookShare}
                  className="flex-1 min-w-[120px] bg-[#1877F2] text-white px-4 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="flex-1 min-w-[120px] bg-[#1DA1F2] text-white px-4 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Twitter className="w-5 h-5" />
                  Twitter
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="flex-1 min-w-[120px] bg-[#25D366] text-white px-4 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full border-2 border-mediterranean-blue text-mediterranean-blue px-4 py-3 rounded-lg font-semibold hover:bg-mediterranean-blue hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add CSS for bounce animation */}
      <style>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentConfirmation;

