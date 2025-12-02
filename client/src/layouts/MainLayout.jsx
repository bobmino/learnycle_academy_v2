import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

/**
 * Main Layout
 * Wraps pages with navbar and footer
 */
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white dark:bg-gray-800 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} LearnCycle Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
