import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  ChevronRight, 
  Droplet, 
  Beaker,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  addMonths, 
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

interface TimeSlot {
  id: string;
  time: string;
  availability: 'available' | 'high-demand' | 'full';
  period?: 'Morning' | 'Afternoon' | 'Evening';
}

interface AvailabilityData {
  [date: string]: {
    slots: TimeSlot[];
    availabilityStatus: 'available' | 'high-demand' | 'full';
  };
}

interface DonationDateTimePickerProps {
  onDateSelect?: (date: Date) => void;
  onTimeSelect?: (time: string) => void;
  onDonationTypeChange?: (type: 'blood' | 'plasma') => void;
  onContinue?: () => void;
  onBack?: () => void;
  availabilityData?: AvailabilityData;
  initialSelectedDate?: Date | null;
  initialSelectedTime?: string | null;
  initialDonationType?: 'blood' | 'plasma';
}

// Mock availability data - replace with actual data source
const generateMockAvailability = (): AvailabilityData => {
  const data: AvailabilityData = {};
  const today = new Date();
  
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateKey = format(date, 'yyyy-MM-dd');
    
    // Skip past dates
    if (date < today) continue;
    
    // Generate random availability
    const statusRoll = Math.random();
    let availabilityStatus: 'available' | 'high-demand' | 'full' = 'available';
    if (statusRoll > 0.8) availabilityStatus = 'full';
    else if (statusRoll > 0.5) availabilityStatus = 'high-demand';
    
    const slots: TimeSlot[] = [];
    const slotTimes = [
      { time: '08:00', period: 'Morning' as const },
      { time: '09:00', period: 'Morning' as const },
      { time: '09:30', period: 'Morning' as const },
      { time: '10:00', period: 'Morning' as const },
      { time: '11:00', period: 'Morning' as const },
      { time: '13:00', period: 'Afternoon' as const },
      { time: '14:00', period: 'Afternoon' as const },
      { time: '15:00', period: 'Afternoon' as const },
      { time: '16:00', period: 'Afternoon' as const },
      { time: '17:00', period: 'Evening' as const },
    ];
    
    slotTimes.forEach((slot, idx) => {
      if (availabilityStatus === 'full' && idx % 2 === 0) {
        slots.push({ id: `${dateKey}-${slot.time}`, time: slot.time, availability: 'full', period: slot.period });
      } else if (availabilityStatus === 'high-demand' && idx % 3 === 0) {
        slots.push({ id: `${dateKey}-${slot.time}`, time: slot.time, availability: 'high-demand', period: slot.period });
      } else {
        slots.push({ id: `${dateKey}-${slot.time}`, time: slot.time, availability: 'available', period: slot.period });
      }
    });
    
    data[dateKey] = { slots, availabilityStatus };
  }
  
  return data;
};

const DonationDateTimePicker: React.FC<DonationDateTimePickerProps> = ({
  onDateSelect,
  onTimeSelect,
  onDonationTypeChange,
  onContinue,
  onBack,
  availabilityData,
  initialSelectedDate = null,
  initialSelectedTime = null,
  initialDonationType = 'blood',
}) => {
  const { t } = useTranslation();
  const [selectedDonationType, setSelectedDonationType] = useState<'blood' | 'plasma'>(initialDonationType);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialSelectedDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(initialSelectedTime);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const availability = availabilityData || generateMockAvailability();
  
  const handleDonationTypeChange = (type: 'blood' | 'plasma') => {
    setSelectedDonationType(type);
    setSelectedDate(null);
    setSelectedTime(null);
    onDonationTypeChange?.(type);
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    onDateSelect?.(date);
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onTimeSelect?.(time);
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const selectedDateAvailability = selectedDate 
    ? availability[format(selectedDate, 'yyyy-MM-dd')] 
    : null;
  
  const selectedDateFormatted = selectedDate 
    ? format(selectedDate, 'EEEE, MMMM d')
    : '';
  
  // Generate calendar months
  const currentMonthCalendar = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);
  
  const nextMonthCalendar = useMemo(() => {
    const nextMonth = addMonths(currentMonth, 1);
    const monthStart = startOfMonth(nextMonth);
    const monthEnd = endOfMonth(nextMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);
  
  const canContinue = selectedDate !== null && selectedTime !== null;
  
  const steps = [
    { id: 1, label: t('booking.steps.selectCenter'), current: false, completed: true },
    { id: 2, label: t('booking.steps.dateTime'), current: true, completed: false },
    { id: 3, label: t('booking.steps.yourDetails'), current: false, completed: false },
    { id: 4, label: t('booking.steps.healthCheck'), current: false, completed: false },
    { id: 5, label: t('booking.steps.confirmation'), current: false, completed: false },
  ];
  
  const currentStepIndex = steps.findIndex((s) => s.current);
  
  return (
    <div className="min-h-screen bg-white">
      {/* Progress Indicator */}
      <div className="bg-cream border-b border-taupe/20 py-4 px-4 md:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, index) => {
              const isCurrent = step.current;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                        isCurrent
                          ? 'bg-terracotta text-white shadow-md'
                          : isCompleted
                            ? 'bg-olive-green text-white'
                            : 'border-2 border-taupe text-taupe bg-white'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center ${
                        isCurrent ? 'text-espresso font-semibold' : 'text-taupe'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-olive-green'
                          : 'bg-mediterranean-blue'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Progress Dots */}
          <div className="flex items-center justify-center gap-2 md:hidden">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step.current
                    ? 'bg-terracotta w-8'
                    : index < currentStepIndex
                      ? 'bg-olive-green w-2'
                      : 'bg-taupe w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-taupe hover:text-espresso border border-taupe hover:border-espresso px-4 py-2 rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>
        
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[32px] font-bold text-espresso mb-3 leading-tight">
            When can you donate?
          </h1>
          <p className="text-base text-taupe leading-relaxed">
            Pick the date and time that fits your schedule.
          </p>
        </div>
        
        {/* Donation Type Selector */}
        <div className="mb-8">
          <div className="flex gap-6" role="radiogroup" aria-label="Donation type">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="donationType"
                value="blood"
                checked={selectedDonationType === 'blood'}
                onChange={() => handleDonationTypeChange('blood')}
                className="w-5 h-5 text-mediterranean-blue border-taupe focus:ring-mediterranean-blue focus:ring-2"
              />
              <Droplet className={`w-5 h-5 ${selectedDonationType === 'blood' ? 'text-mediterranean-blue' : 'text-taupe'}`} />
              <span className={`text-base ${selectedDonationType === 'blood' ? 'text-espresso font-semibold' : 'text-espresso'}`}>
                Blood Donation
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="donationType"
                value="plasma"
                checked={selectedDonationType === 'plasma'}
                onChange={() => handleDonationTypeChange('plasma')}
                className="w-5 h-5 text-mediterranean-blue border-taupe focus:ring-mediterranean-blue focus:ring-2"
              />
              <Beaker className={`w-5 h-5 ${selectedDonationType === 'plasma' ? 'text-mediterranean-blue' : 'text-taupe'}`} />
              <span className={`text-base ${selectedDonationType === 'plasma' ? 'text-espresso font-semibold' : 'text-espresso'}`}>
                Plasma Donation
              </span>
            </label>
          </div>
        </div>
        
        {/* Calendar View */}
        <div className="bg-cream rounded-lg p-4 md:p-6 mb-6">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handlePrevMonth}
              className="text-mediterranean-blue hover:text-mediterranean-blue/80 transition-colors duration-300 flex items-center gap-1 text-sm md:text-base font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>‹ Prev Month</span>
            </button>
            <button
              onClick={handleNextMonth}
              className="text-mediterranean-blue hover:text-mediterranean-blue/80 transition-colors duration-300 flex items-center gap-1 text-sm md:text-base font-medium"
            >
              <span>Next Month ›</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Two Months Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 calendar-month-transition">
            {/* Current Month */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold text-espresso mb-4 text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
                  <div key={day} className="text-xs font-semibold text-taupe text-center py-2">
                    {t(`booking.step2.days.${day}`)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {currentMonthCalendar.map(day => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayAvailability = availability[dayKey];
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);
                  const isPast = day < new Date() && !isTodayDate;
                  const hasAvailability = dayAvailability && !isPast;
                  
                  if (!isCurrentMonth) {
                    return <div key={dayKey} className="aspect-square" />;
                  }
                  
                  return (
                    <button
                      key={dayKey}
                      onClick={() => hasAvailability && handleDateSelect(day)}
                      disabled={!hasAvailability}
                      className={`
                        aspect-square rounded-lg text-sm font-semibold transition-all duration-200 relative
                        ${isSelected 
                          ? 'bg-terracotta text-white' 
                          : hasAvailability 
                            ? 'text-espresso hover:bg-terracotta/10 cursor-pointer'
                            : 'text-taupe/50 line-through cursor-not-allowed'
                        }
                        ${isTodayDate && !isSelected ? 'ring-2 ring-mediterranean-blue' : ''}
                      `}
                    >
                      {format(day, 'd')}
                      {hasAvailability && (
                        <span className={`
                          absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full
                          ${dayAvailability.availabilityStatus === 'available' ? 'bg-olive-green' : ''}
                          ${dayAvailability.availabilityStatus === 'high-demand' ? 'bg-burnt-orange' : ''}
                          ${dayAvailability.availabilityStatus === 'full' ? 'bg-taupe' : ''}
                        `} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Next Month */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold text-espresso mb-4 text-center">
                {format(addMonths(currentMonth, 1), 'MMMM yyyy')}
              </h3>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
                  <div key={day} className="text-xs font-semibold text-taupe text-center py-2">
                    {t(`booking.step2.days.${day}`)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {nextMonthCalendar.map(day => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayAvailability = availability[dayKey];
                  const nextMonth = addMonths(currentMonth, 1);
                  const isCurrentMonth = isSameMonth(day, nextMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);
                  const isPast = day < new Date() && !isTodayDate;
                  const hasAvailability = dayAvailability && !isPast;
                  
                  if (!isCurrentMonth) {
                    return <div key={dayKey} className="aspect-square" />;
                  }
                  
                  return (
                    <button
                      key={dayKey}
                      onClick={() => hasAvailability && handleDateSelect(day)}
                      disabled={!hasAvailability}
                      className={`
                        aspect-square rounded-lg text-sm font-semibold transition-all duration-200 relative
                        ${isSelected 
                          ? 'bg-terracotta text-white' 
                          : hasAvailability 
                            ? 'text-espresso hover:bg-terracotta/10 cursor-pointer'
                            : 'text-taupe/50 line-through cursor-not-allowed'
                        }
                        ${isTodayDate && !isSelected ? 'ring-2 ring-mediterranean-blue' : ''}
                      `}
                    >
                      {format(day, 'd')}
                      {hasAvailability && (
                        <span className={`
                          absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full
                          ${dayAvailability.availabilityStatus === 'available' ? 'bg-olive-green' : ''}
                          ${dayAvailability.availabilityStatus === 'high-demand' ? 'bg-burnt-orange' : ''}
                          ${dayAvailability.availabilityStatus === 'full' ? 'bg-taupe' : ''}
                        `} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Availability Legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-olive-green" />
              <span className="text-espresso">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-burnt-orange" />
              <span className="text-espresso">High Demand</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-taupe" />
              <span className="text-espresso">Full</span>
            </div>
          </div>
        </div>
        
        {/* Time Slot Selection */}
        {selectedDate && selectedDateAvailability && (
          <div className="mb-6 animate-slide-down">
            <h2 className="text-xl font-semibold text-espresso mb-4">
              Select a time for {selectedDateFormatted}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedDateAvailability.slots.map(slot => {
                const isSelected = selectedTime === slot.time;
                const isFull = slot.availability === 'full';
                const isHighDemand = slot.availability === 'high-demand';
                const isAvailable = slot.availability === 'available';
                
                return (
                  <button
                    key={slot.id}
                    onClick={() => !isFull && handleTimeSelect(slot.time)}
                    disabled={isFull}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-300 text-left
                      ${isSelected 
                        ? 'bg-terracotta text-white border-terracotta shadow-md' 
                        : isFull
                          ? 'bg-taupe/20 border-taupe/50 text-taupe/70 line-through cursor-not-allowed'
                          : isHighDemand
                            ? 'border-burnt-orange bg-white hover:border-burnt-orange/80 hover:bg-burnt-orange/5'
                            : isAvailable
                              ? 'border-olive-green bg-white hover:border-mediterranean-blue hover:bg-mediterranean-blue/5'
                              : 'border-taupe bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-base">
                        {slot.time} {slot.period && !isFull ? (slot.period === 'Morning' ? t('booking.step2.morning') : slot.period === 'Afternoon' ? t('booking.step2.afternoon') : t('booking.step2.evening')) : isFull ? t('booking.step2.full') : isHighDemand ? t('booking.step2.highDemand') : t('booking.step2.available')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Alternative Options */}
            <div className="mt-4">
              <a
                href="#"
                className="text-mediterranean-blue hover:text-mediterranean-blue/80 text-sm underline transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  // Modal implementation would go here
                }}
              >
                Need a different time? Request a callback or join our waitlist
              </a>
            </div>
          </div>
        )}
        
        {/* Helpful Context */}
        <div className="bg-cream rounded-lg p-4 mb-6">
          <p className="text-sm text-taupe flex items-start gap-2">
            <span>💡</span>
            <span>Mornings are popular. Afternoon slots fill up fast in summer.</span>
          </p>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-taupe/20">
          <div className="flex-1" />
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className={`
              px-8 py-3 rounded-lg font-bold text-base transition-all duration-300
              ${canContinue 
                ? 'bg-terracotta hover:bg-[#C5694A] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]' 
                : 'bg-taupe/30 text-taupe cursor-not-allowed opacity-50'
              }
            `}
          >
            Select Date & Continue →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationDateTimePicker;

