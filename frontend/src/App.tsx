import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuthStore();
  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748b' }}>Cargando...</div>;
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{title}</h1>
      <p style={{ color: '#64748b' }}>Esta sección estará disponible próximamente.</p>
    </div>
  );
}

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<PlaceholderPage title="Cuentas" />} />
          <Route path="transactions" element={<PlaceholderPage title="Transacciones" />} />
          <Route path="budgets" element={<PlaceholderPage title="Presupuestos" />} />
          <Route path="goals" element={<PlaceholderPage title="Metas" />} />
          <Route path="investments" element={<PlaceholderPage title="Inversiones" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
