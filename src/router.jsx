import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import SolarReactorDashboard from './pages/SolarReactorDashboard.jsx';
import PadInput from './pages/PadInput.jsx';
import CollectionDashboard from './pages/CollectionDashboard.jsx';
import FuelSales from './pages/FuelSales.jsx';
import BatchDetails from './pages/BatchDetails.jsx';
import PlantProfile from './pages/PlantProfile.jsx';
import SystemSettings from './pages/SystemSettings.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

// Placeholder for missing pages
const PlaceholderPage = ({ title }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-20 flex items-center justify-center">
    <div className="text-center glass rounded-2xl p-12 max-w-md">
      <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
      <p className="text-gray-400 mb-6">This page is coming soon!</p>
      <a href="/" className="bg-gradient-primary text-white px-6 py-3 rounded-lg inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Main pages
      { path: '/', element: <Home /> },
      { path: '/solar-reactor', element: <SolarReactorDashboard /> },
      { path: '/pad-input', element: <PadInput /> },
      { path: '/collection-dashboard', element: <CollectionDashboard /> },
      { path: '/fuel-sales', element: <FuelSales /> },
      { path: '/batch-details/:id', element: <BatchDetails /> },
      { path: '/plant-profile', element: <PlantProfile /> },
      { path: '/system-settings', element: <SystemSettings /> },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },

      // Legacy / old routes for backward compatibility
      { path: '/AIGRader', element: <SolarReactorDashboard /> },
      { path: '/CropPrediction', element: <PadInput /> },
      { path: '/Farmer-Dashboard', element: <CollectionDashboard /> },
      { path: '/Marketplace', element: <FuelSales /> },
      { path: '/ProduceDetails/:id', element: <BatchDetails /> },
      { path: '/Profile', element: <PlantProfile /> },
      { path: '/Settings', element: <SystemSettings /> },
      { path: '/register', element: <Signup /> },

      // Placeholder pages
      { path: '/how-it-works', element: <PlaceholderPage title="How It Works" /> },
      { path: '/farmers', element: <PlaceholderPage title="For Farmers" /> },
      { path: '/buyers', element: <PlaceholderPage title="For Buyers" /> },
      { path: '/success-stories', element: <PlaceholderPage title="Success Stories" /> },
      { path: '/pricing', element: <PlaceholderPage title="Pricing" /> },
      { path: '/docs', element: <PlaceholderPage title="Documentation" /> },
      { path: '/help', element: <PlaceholderPage title="Help Center" /> },
      { path: '/blog', element: <PlaceholderPage title="Blog" /> },
      { path: '/api', element: <PlaceholderPage title="API Reference" /> },
      { path: '/about', element: <PlaceholderPage title="About Us" /> },
      { path: '/careers', element: <PlaceholderPage title="Careers" /> },
      { path: '/press', element: <PlaceholderPage title="Press" /> },
      { path: '/contact', element: <PlaceholderPage title="Contact" /> },
      { path: '/partners', element: <PlaceholderPage title="Partners" /> },
      { path: '/privacy', element: <PlaceholderPage title="Privacy Policy" /> },
      { path: '/terms', element: <PlaceholderPage title="Terms of Service" /> },
      { path: '/cookies', element: <PlaceholderPage title="Cookie Policy" /> },
      { path: '/conduct', element: <PlaceholderPage title="Code of Conduct" /> },

      // Catch-all 404
      {
        path: '*',
        element: (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-20 flex items-center justify-center">
            <div className="text-center glass rounded-2xl p-12 max-w-md">
              <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
              <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
              <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="bg-gradient-primary text-white px-6 py-3 rounded-lg inline-block">
                Back to Home
              </a>
            </div>
          </div>
        ),
      },
    ],
  },
]);

export default router;
