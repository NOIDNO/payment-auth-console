import { Routes, Route } from 'react-router-dom';
import AuthGate from './components/AuthGate.jsx';
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

const App = () => {
  return (
    <AuthGate>
      {(user) => (
        <Routes>
          <Route element={<Layout user={user} />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/payments" element={<PaymentListPage />} />
          </Route>
        </Routes>
      )}
    </AuthGate>
  );
};

export default App;