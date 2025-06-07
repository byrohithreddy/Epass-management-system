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
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;