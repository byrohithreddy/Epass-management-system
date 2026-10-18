import React, { useState } from 'react';
import Navigation from './components/Navigation';
import StudentPage from './pages/StudentPage';
import AdminPage from './pages/AdminPage';
import GuardPage from './pages/GuardPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'student' | 'admin' | 'guard'>('student');

  const renderPage = () => {
    switch (currentPage) {
      case 'student':
        return <StudentPage />;
      case 'admin':
        return <AdminPage />;
      case 'guard':
        return <GuardPage />;
      default:
        return <StudentPage />;
    }
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main id="main-content" className="workspace-frame" tabIndex={-1}>
        <div key={currentPage} className="page-transition">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;