import { StrictMode, Suspense, lazy, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { initKeyboardViewport } from './lib/keyboardViewport';
import PageLoader from './components/PageLoader';
import { Toaster } from 'sonner';
import './index.css';

const App = lazy(() => import('./App.tsx'));
const LoginPage = lazy(() => import('./components/LoginPage.tsx'));
const AdminCodesPage = lazy(() => import('./components/AdminCodesPage.tsx'));

function Root() {
  useEffect(() => initKeyboardViewport(), []);
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <LanguageProvider>
          <HashRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/admin/codes" element={<AdminCodesPage />} />
                <Route path="/nutrition/*" element={<Navigate to="/" replace />} />
                <Route path="/login/returning" element={<LoginPage />} />
                <Route path="/login/:userId" element={<LoginPage />} />
              </Routes>
            </Suspense>
            <Toaster
              position="top-center"
              toastOptions={{
                className: 'font-sans text-sm',
                style: {
                  background: 'rgba(26,25,24,0.92)',
                  border: '1px solid #2E2C29',
                  color: '#F2EDE6',
                  borderRadius: '14px',
                  backdropFilter: 'blur(14px)',
                  boxShadow: '0 18px 40px -20px rgba(0,0,0,0.9)',
                },
              }}
            />
          </HashRouter>
        </LanguageProvider>
      </AuthProvider>
    </MotionConfig>
  );
}

const container = document.getElementById('root')!;
type RootHandle = ReturnType<typeof createRoot>;
const rootKey = '__hybridAthleteRoot__';
const existingRoot = (container as HTMLElement & { [rootKey]?: RootHandle })[rootKey];
const root = existingRoot ?? createRoot(container);
(container as HTMLElement & { [rootKey]?: RootHandle })[rootKey] = root;

root.render(
  <StrictMode>
    <Root />
  </StrictMode>
);
