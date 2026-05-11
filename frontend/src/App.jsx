import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import SalesAnalytics from './pages/SalesAnalytics';
import AIAdvisor from './pages/AIAdvisor';
import Customers from './pages/Customers';
import { BusinessDataProvider } from './context/BusinessDataContext';

function App() {
  return (
    <BusinessDataProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<SalesAnalytics />} />
            <Route path="/ai-advisor" element={<AIAdvisor />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </BusinessDataProvider>
  );
}

export default App;
