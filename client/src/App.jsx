import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import Flowers from './pages/Flowers';
import Search from './pages/Search';
import MyProfile from './pages/MyProfile';

function PrivateRoute({ children, adminOnly }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="container">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/ho-so" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dang-ky" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="thanh-vien" element={<PrivateRoute adminOnly><Members /></PrivateRoute>} />
        <Route path="thanh-vien/:id" element={<MemberDetail />} />
        <Route path="hoa" element={<PrivateRoute adminOnly><Flowers /></PrivateRoute>} />
        <Route path="tim-kiem" element={<Search />} />
        <Route path="ho-so" element={<MyProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
