import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuthProvider from './components/AuthProvider';
import StaffAuthProvider from './components/StaffAuthProvider';
import PinAuthProvider from './components/PinAuthProvider';
import LoginForm from './components/LoginForm';
import DonorRegistration from './components/DonorRegistration';
import StaffLogin from './components/StaffLogin';
import Dashboard from './components/Dashboard';
import StaffDashboard from './components/StaffDashboard';
import LandingPage from './components/LandingPage';
import DeployProject from './components/DeployProject';
import BloodCenterForm from './components/BloodCenterForm';
import PinAuthDemo from './components/PinAuthDemo';
import PinSetupFlow from './components/PinSetupFlow';
import PinLoginScreen from './components/PinLoginScreen';
import EmailVerification from './components/EmailVerification';
import PinDebugTool from './components/PinDebugTool';

import { CHAT_CONFIG } from './config/chat';
import { useAuth } from './hooks/useAuth';
import { useStaffAuth } from './hooks/useStaffAuth';
import { hasValidPinData } from './utils/pinStorage';
import { Users, Shield, ArrowLeft, UserPlus, Key } from 'lucide-react';

// Import i18n configuration
import './i18n';

type LoginMode = 'donor' | 'staff';
type DonorMode = 'login' | 'register';
type Route = 'landing' | 'donor' | 'staff' | 'deploy' | 'bloodCenterForm' | 'pinAuth' | 'pinSetup' | 'pinLogin' | 'emailVerification' | 'pinDebug' | 'donorRegister';

// Add error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
            <h1 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">The application encountered an error. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple test component without any external dependencies
function TestComponent() {
  console.log('TestComponent: Rendering');
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f9ff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#2563eb', 
          marginBottom: '1rem' 
        }}>
          Test Component
        </h1>
        <p style={{ color: '#6b7280' }}>
          If you can see this, React is working!
        </p>
        <button 
          style={{ 
            marginTop: '1rem', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            padding: '0.5rem 1rem', 
            borderRadius: '0.25rem', 
            border: 'none', 
            cursor: 'pointer' 
          }}
          onClick={() => alert('Button clicked!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

function DonorAppContent({ onBackToLanding, onRouteChange, initialMode = 'login' }: { onBackToLanding?: () => void; onRouteChange?: (route: Route) => void; initialMode?: DonorMode }) {
  const { donor, loading } = useAuth();
  const [donorMode, setDonorMode] = useState<DonorMode>(initialMode);

  console.log('DonorAppContent render:', { donor, loading, donorMode });

  // Check if user has PIN setup and redirect to PIN login
  // This useEffect must be called before any conditional returns
  React.useEffect(() => {
    const checkPinAndRedirect = async () => {
      try {
        // Only redirect if no donor is authenticated and we're not already on PIN login
        if (donor || loading) {
          console.log('Donor authenticated or still loading, skipping PIN redirect check');
          return;
        }

        const hasPin = await hasValidPinData();
        
        if (hasPin && onRouteChange) {
          console.log('User has PIN set up, redirecting to PIN login');
          onRouteChange('pinLogin');
        }
      } catch (error) {
        console.error('Error checking PIN status:', error);
        // Continue with traditional login if check fails
      }
    };

    checkPinAndRedirect();
  }, [donor, loading, onRouteChange]);

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
        onSuccess={() => {
          // Navigate to PIN setup instead of login
          if (onRouteChange) {
            onRouteChange('pinSetup');
          } else {
            setDonorMode('login');
          }
        }}
        onBackToLanding={onBackToLanding}
      />
    );
  }

  return <LoginForm 
    onShowRegistration={() => setDonorMode('register')} 
    onBackToLanding={onBackToLanding}
    onPinSetup={() => {
      console.log('PIN setup button clicked, changing route to pinSetup');
      if (onRouteChange) {
        onRouteChange('pinSetup');
      }
    }}
  />;
}

function StaffAppContent({ onBackToLanding }: { onBackToLanding?: () => void }) {
  const { staff, loading } = useStaffAuth();

  console.log('StaffAppContent render:', { staff, loading });

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

  return staff ? <StaffDashboard /> : <StaffLogin onBackToLanding={onBackToLanding} />;
}

function LoginModeSelector({ onSelectMode }: { onSelectMode: (mode: LoginMode) => void }) {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('loginMode.title')}</h1>
          <p className="text-gray-600">{t('loginMode.subtitle')}</p>
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
                <h3 className="text-lg font-semibold text-gray-900">{t('loginMode.donorPortal')}</h3>
                <p className="text-sm text-gray-600">{t('loginMode.donorPortalDesc')}</p>
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
                <h3 className="text-lg font-semibold text-gray-900">{t('loginMode.staffPortal')}</h3>
                <p className="text-sm text-gray-600">{t('loginMode.staffPortalDesc')}</p>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            {t('landing.needHelp')}
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState<Route>('landing');

  console.log('App render:', { route });
  
  // Debug route changes
  const handleRouteChange = (newRoute: Route) => {
    console.log('Route changing from', route, 'to', newRoute);
    setRoute(newRoute);
  };

  // Add a simple loading state
  if (typeof window === 'undefined') {
    return <div>Loading...</div>;
  }

  if (route === 'donor') {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <DonorAppContent 
            onBackToLanding={() => handleRouteChange('landing')} 
            onRouteChange={handleRouteChange}
          />
        </AuthProvider>
      </ErrorBoundary>
    );
  }
  
  if (route === 'donorRegister') {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <DonorAppContent 
            onBackToLanding={() => handleRouteChange('landing')} 
            onRouteChange={handleRouteChange}
            initialMode="register"
          />
        </AuthProvider>
      </ErrorBoundary>
    );
  }
  if (route === 'staff') {
    return (
      <ErrorBoundary>
        <StaffAuthProvider>
          <StaffAppContent onBackToLanding={() => handleRouteChange('landing')} />
        </StaffAuthProvider>
      </ErrorBoundary>
    );
  }
  
  if (route === 'deploy') {
    return (
      <ErrorBoundary>
        <DeployProject onBackToLanding={() => handleRouteChange('landing')} />
      </ErrorBoundary>
    );
  }
  
  if (route === 'bloodCenterForm') {
    return (
      <ErrorBoundary>
        <BloodCenterForm onBackToLanding={() => handleRouteChange('landing')} />
      </ErrorBoundary>
    );
  }
  
  if (route === 'pinAuth') {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <PinAuthProvider>
            <PinAuthDemo onBackToLanding={() => handleRouteChange('landing')} />
          </PinAuthProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  }
  
  if (route === 'pinSetup') {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <PinAuthProvider>
            <PinSetupFlow 
              onComplete={() => handleRouteChange('pinLogin')}
              onCancel={() => handleRouteChange('donor')}
              onBackToLanding={() => handleRouteChange('landing')}
            />
          </PinAuthProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  }
  
  if (route === 'pinLogin') {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <PinAuthProvider>
            <PinLoginScreen 
              onSuccess={() => handleRouteChange('donor')}
              onBackToLanding={() => handleRouteChange('landing')}
              onTraditionalLogin={() => handleRouteChange('donor')}
              onPinSetup={() => handleRouteChange('pinSetup')}
            />
          </PinAuthProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  }
  
  if (route === 'emailVerification') {
    // Get verification token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    return (
      <ErrorBoundary>
        <AuthProvider>
          <EmailVerification 
            token={token || undefined}
            onBack={() => handleRouteChange('landing')}
            onSuccess={() => handleRouteChange('donor')}
            onPinSetup={() => handleRouteChange('pinSetup')}
          />
        </AuthProvider>
      </ErrorBoundary>
    );
  }
  
  if (route === 'pinDebug') {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <PinAuthProvider>
            <div className="min-h-screen bg-gray-50 p-4">
              <div className="mb-4">
                <button
                  onClick={() => handleRouteChange('landing')}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  ← Back to Landing
                </button>
              </div>
              <PinDebugTool />
            </div>
          </PinAuthProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  }
  
  // Handler for Quick PIN Login button - checks PIN status and routes accordingly
  const handleQuickPinLogin = async () => {
    try {
      console.log('Quick PIN Login clicked - checking PIN status...');
      const hasPinSetup = await hasValidPinData();
      console.log('PIN status check result:', { hasPinSetup });
      
      if (hasPinSetup) {
        // User has PIN set up, route to PIN login
        console.log('User has PIN - routing to PIN login');
        handleRouteChange('pinLogin');
      } else {
        // User doesn't have PIN set up, route to PIN setup
        console.log('User does not have PIN - routing to PIN setup');
        handleRouteChange('pinSetup');
      }
    } catch (error) {
      console.error('Error checking PIN status:', error);
      // On error, default to PIN login which will handle the flow
      handleRouteChange('pinLogin');
    }
  };

  // Pass navigation handlers to LandingPage
  return (
    <ErrorBoundary>
      <LandingPage 
        onStaffPortal={() => handleRouteChange('staff')}
        onDeployProject={() => handleRouteChange('bloodCenterForm')}
        onPinAuthDemo={() => handleRouteChange('pinAuth')}
        onPinLogin={handleQuickPinLogin}
        onPinDebug={() => handleRouteChange('pinDebug')}
        onDonorRegistration={() => handleRouteChange('donorRegister')}
      />
    </ErrorBoundary>
  );
}

export default App;