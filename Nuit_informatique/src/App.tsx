import { useState } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './features/landing/LandingPage';

function App() {
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) {
    return <LandingPage onComplete={() => setShowLanding(false)} />;
  }

  return <DashboardLayout />;
}

export default App;
