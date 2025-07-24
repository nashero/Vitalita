import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Droplets, 
  Heart,
  Building2,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface DonationCenter {
  center_id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  contact_phone: string | null;
  email: string | null;
}

interface AvailabilitySlot {
  slot_id: string;
  center_id: string;
  slot_datetime: string;
  donation_type: string;
  capacity: number;
  current_bookings: number;
  center?: DonationCenter;
}

type DonationType = 'Blood' | 'Plasma';
type BookingStep = 'type' | 'slots' | 'confirmation' | 'success';

interface AppointmentBookingProps {
  onBack: () => void;
}

export default function AppointmentBooking({ onBack }: AppointmentBookingProps) {
  const { donor } = useAuth();
  const [currentStep, setCurrentStep] = useState<BookingStep>('type');
  const [selectedType, setSelectedType] = useState<DonationType | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const donationTypes = [
    {
      type: 'Blood' as DonationType,
      icon: Droplets,
      title: 'Blood Donation',
      description: 'Whole blood donation to help save lives',
      duration: '45-60 minutes',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200 hover:border-red-300',
    },
    {
      type: 'Plasma' as DonationType,
      icon: Heart,
      title: 'Plasma Donation',
      description: 'Plasma donation for medical treatments',
      duration: '90-120 minutes',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200 hover:border-blue-300',
    },
  ];

  const fetchAvailableSlots = async (donationType: DonationType) => {
    try {
      setLoading(true);
      setError('');

      // Mock data for demonstration purposes
      // In a real application, this would fetch from a backend
      const mockSlots: AvailabilitySlot[] = [
        {
          slot_id: 'mock-slot-1',
          center_id: 'mock-center-1',
          slot_datetime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          donation_type: donationType,
          capacity: 10,
          current_bookings: 5,
          center: {
            center_id: 'mock-center-1',
            name: 'Mock Donation Center 1',
            address: '123 Mock Street',
            city: 'Mock City',
            country: 'Mockland',
            contact_phone: '123-456-7890',
            email: 'info@mockcenter.com',
          },
        },
        {
          slot_id: 'mock-slot-2',
          center_id: 'mock-center-1',
          slot_datetime: new Date(Date.now() + 172800000).toISOString(), // Two days later
          donation_type: donationType,
          capacity: 10,
          current_bookings: 2,
          center: {
            center_id: 'mock-center-1',
            name: 'Mock Donation Center 1',
            address: '123 Mock Street',
            city: 'Mock City',
            country: 'Mockland',
            contact_phone: '123-456-7890',
            email: 'info@mockcenter.com',
          },
        },
      ];

      setAvailableSlots(mockSlots);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load available appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelection = (type: DonationType) => {
    setSelectedType(type);
    setCurrentStep('slots');
    fetchAvailableSlots(type);
  };

  const handleSlotSelection = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setCurrentStep('confirmation');
  };

  const confirmBooking = async () => {
    if (!selectedSlot || !donor || !selectedType) return;

    try {
      setLoading(true);
      setError('');

      // Mock booking logic
      console.log('Attempting to book appointment...');
      console.log('Donor:', donor.donor_hash_id);
      console.log('Slot:', selectedSlot.slot_id);
      console.log('Type:', selectedType);

      // Simulate successful booking
      await new Promise(resolve => setTimeout(resolve, 1000));

      setBookingSuccess(true);
      setCurrentStep('success');
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getAvailabilityColor = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage < 50) return 'text-green-600 bg-green-100';
    if (percentage < 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'type', label: 'Type', completed: currentStep !== 'type' },
      { id: 'slots', label: 'Schedule', completed: currentStep === 'confirmation' || currentStep === 'success' },
      { id: 'confirmation', label: 'Confirm', completed: currentStep === 'success' },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
              step.completed 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : currentStep === step.id
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-gray-300 text-gray-400'
            }`}>
              {step.completed ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            <div className="ml-3 mr-8">
              <p className={`text-sm font-medium ${
                step.completed || currentStep === step.id ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                step.completed ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderTypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Donation Type</h2>
        <p className="text-gray-600">Select the type of donation you'd like to make</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {donationTypes.map((donation) => {
          const Icon = donation.icon;
          return (
            <button
              key={donation.type}
              onClick={() => handleTypeSelection(donation.type)}
              className={`p-8 rounded-2xl border-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${donation.borderColor} ${donation.bgColor} hover:shadow-lg`}
            >
              <div className="text-center">
                <div className={`inline-flex p-4 rounded-full ${donation.bgColor} mb-4`}>
                  <Icon className={`w-8 h-8 ${donation.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{donation.title}</h3>
                <p className="text-gray-600 mb-4">{donation.description}</p>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  {donation.duration}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSlotSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Appointments</h2>
        <p className="text-gray-600">Choose a convenient time for your {selectedType?.toLowerCase()} donation</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading available appointments...</span>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments available</h3>
          <p className="text-gray-600">Please try again later or contact us for assistance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {availableSlots.map((slot) => {
            const dateTime = formatDateTime(slot.slot_datetime);
            const availabilityClass = getAvailabilityColor(slot.current_bookings, slot.capacity);
            
            return (
              <div
                key={slot.slot_id}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {slot.center?.name}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {slot.center?.address}, {slot.center?.city}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${availabilityClass}`}>
                      {slot.capacity - slot.current_bookings} spots left
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="font-medium">{dateTime.date}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="font-medium">{dateTime.time}</span>
                    </div>
                  </div>

                  {slot.center?.contact_phone && (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Phone className="w-3 h-3 mr-2" />
                      {slot.center.contact_phone}
                    </div>
                  )}

                  <button
                    onClick={() => handleSlotSelection(slot)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Select This Time
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderConfirmation = () => {
    if (!selectedSlot || !selectedType) return null;
    
    const dateTime = formatDateTime(selectedSlot.slot_datetime);
    
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Appointment</h2>
          <p className="text-gray-600">Please review your appointment details</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Appointment Summary</h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Donation Type</span>
              <span className="font-semibold text-gray-900">{selectedType}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Date</span>
              <span className="font-semibold text-gray-900">{dateTime.date}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Time</span>
              <span className="font-semibold text-gray-900">{dateTime.time}</span>
            </div>
            
            <div className="py-3 border-b border-gray-100">
              <span className="text-gray-600 block mb-2">Location</span>
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{selectedSlot.center?.name}</p>
                <p className="text-gray-600 text-sm">{selectedSlot.center?.address}</p>
                <p className="text-gray-600 text-sm">{selectedSlot.center?.city}, {selectedSlot.center?.country}</p>
              </div>
            </div>
            
            {selectedSlot.center?.contact_phone && (
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">Contact</span>
                <span className="font-semibold text-gray-900">{selectedSlot.center.contact_phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Important Reminders:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Please arrive 15 minutes early</li>
                <li>• Bring a valid ID</li>
                <li>• Eat a healthy meal before donating</li>
                <li>• Stay hydrated</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep('slots')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to Slots
          </button>
          <button
            onClick={confirmBooking}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Booking...
              </div>
            ) : (
              <>
                <Check className="w-4 h-4 inline mr-2" />
                Confirm Booking
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderSuccess = () => {
    if (!selectedSlot || !selectedType) return null;
    
    const dateTime = formatDateTime(selectedSlot.slot_datetime);
    
    return (
      <div className="space-y-6 max-w-2xl mx-auto text-center">
        <div className="bg-green-100 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
          <p className="text-gray-600 text-lg">Your {selectedType.toLowerCase()} donation is scheduled</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">{dateTime.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold">{dateTime.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-semibold">{selectedSlot.center?.name}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center text-green-800">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Confirmation sent to your preferred communication channel</span>
          </div>
        </div>

        <button
          onClick={onBack}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
        >
          Return to Dashboard
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Book Appointment</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepIndicator()}

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'type' && renderTypeSelection()}
        {currentStep === 'slots' && renderSlotSelection()}
        {currentStep === 'confirmation' && renderConfirmation()}
        {currentStep === 'success' && renderSuccess()}
      </main>
    </div>
  );
}