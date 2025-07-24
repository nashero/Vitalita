import React, { useState } from 'react';
import AuthProvider from './components/AuthProvider';
import StaffAuthProvider from './components/StaffAuthProvider';
import LoginForm from './components/LoginForm';
import DonorRegistration from './components/DonorRegistration';
import StaffLogin from './components/StaffLogin';
import Dashboard from './components/Dashboard';
import StaffDashboard from './components/StaffDashboard';
import LandingPage from './components/LandingPage';
import { useAuth } from './hooks/useAuth';
import { useStaffAuth } from './hooks/useStaffAuth';
import { Users, Shield, ArrowLeft, UserPlus } from 'lucide-react';

type LoginMode = 'donor' | 'staff';
type DonorMode = 'login' | 'register';

function DonorAppContent({ onBackToLanding }: { onBackToLanding?: () => void }) {
  const { donor, loading } = useAuth();
  const [donorMode, setDonorMode] = useState<DonorMode>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (donor) {
    return <Dashboard onBackToLanding={onBackToLanding} />;
  }

  if (donorMode === 'register') {
    return (
      <DonorRegistration 
        onBack={() => setDonorMode('login')}
        onSuccess={() => setDonorMode('login')}
      />
    );
  }

  return <LoginForm onShowRegistration={() => setDonorMode('register')} />;
}

function StaffAppContent({ onBackToLanding }: { onBackToLanding?: () => void }) {
  const { staff, loading } = useStaffAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  if (staff) {
    return <StaffDashboard onBackToLanding={onBackToLanding} />;
  }

  return staff ? <StaffDashboard /> : <StaffLogin />;
}

function LoginModeSelector({ onSelectMode }: { onSelectMode: (mode: LoginMode) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vitalita Portal</h1>
          <p className="text-gray-600">Choose your login type to continue</p>
        </div>

        <div className="space-y-4">
          {/* Donor Login */}
          <button
            onClick={() => onSelectMode('donor')}
            className="w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-200 transition-colors">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-semibold text-gray-900">Donor Portal</h3>
                <p className="text-sm text-gray-600">Schedule appointments and manage donations</p>
              </div>
            </div>
          </button>

          {/* Staff Login */}
          <button
            onClick={() => onSelectMode('staff')}
            className="w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-slate-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center">
              <div className="bg-slate-100 p-4 rounded-full group-hover:bg-slate-200 transition-colors">
                <Shield className="w-8 h-8 text-slate-600" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-semibold text-gray-900">Staff Portal</h3>
                <p className="text-sm text-gray-600">Administrative dashboard and management</p>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Need help? Contact your administrator
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState<'landing' | 'donor' | 'staff'>('landing');

  if (route === 'donor') {
    return (
      <AuthProvider>
        <DonorAppContent onBackToLanding={() => setRoute('landing')} />
      </AuthProvider>
    );
  }
  if (route === 'staff') {
    return (
      <StaffAuthProvider>
        <StaffAppContent onBackToLanding={() => setRoute('landing')} />
      </StaffAuthProvider>
    );
  }
  // Pass navigation handlers to LandingPage
  return <LandingPage onDonorPortal={() => setRoute('donor')} onStaffPortal={() => setRoute('staff')} />;
}

export default App;