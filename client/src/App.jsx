import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import store from './store/store';
import i18n from './i18n/i18n';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProspectForm from './pages/ProspectForm';
import Teamwork from './pages/Teamwork';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import Notifications from './pages/Notifications';
import Discussions from './pages/Discussions';
import Grading from './pages/Grading';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Approvals from './pages/Approvals';
import ContentCreator from './pages/ContentCreator';
import Analytics from './pages/Analytics';

import './index.css';

/**
 * Main App Component
 * Configures routing and providers
 */
function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <Router>
            <Routes>
            {/* Public routes with layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/prospect-form" element={<ProspectForm />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/modules"
                element={
                  <ProtectedRoute>
                    <Modules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/modules/:id"
                element={
                  <ProtectedRoute>
                    <ModuleDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teamwork"
                element={
                  <ProtectedRoute>
                    <Teamwork />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups"
                element={
                  <ProtectedRoute>
                    <Groups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups/:id"
                element={
                  <ProtectedRoute>
                    <Groups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discussions"
                element={
                  <ProtectedRoute>
                    <Discussions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discussions/:id"
                element={
                  <ProtectedRoute>
                    <Discussions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grading"
                element={
                  <ProtectedRoute>
                    <Grading />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute>
                    <Approvals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/content-creator"
                element={
                  <ProtectedRoute>
                    <ContentCreator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
            </Route>
            </Routes>
          </Router>
        </I18nextProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
