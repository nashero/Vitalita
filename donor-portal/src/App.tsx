import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import SkipToMain from './components/SkipToMain';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import Footer from './components/Footer';

// Code splitting: Lazy load routes
const HomePage = lazy(() => import('./pages/Home'));
const BookingFlow = lazy(() => import('./pages/BookingFlow'));
const MyAppointments = lazy(() => import('./pages/MyAppointments'));
const HelpPage = lazy(() => import('./pages/Help'));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SkipToMain />
        <div className="app-shell">
          <Header />
          <main id="main-content">
            <Suspense
              fallback={
                <LoadingSpinner
                  fullScreen
                  message="Loading page..."
                  size="large"
                />
              }
            >
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/book" element={<BookingFlow />} />
                  <Route path="/appointments" element={<MyAppointments />} />
                  <Route path="/help" element={<HelpPage />} />
                </Routes>
              </ErrorBoundary>
            </Suspense>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

