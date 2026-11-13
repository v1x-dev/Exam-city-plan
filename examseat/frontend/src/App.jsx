import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing"; import Login from "./pages/Login"; import Register from "./pages/Register"; import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students"; import Rooms from "./pages/Rooms"; import Examinations from "./pages/Examinations"; import Generate from "./pages/Generate"; import FindSeat from "./pages/FindSeat";
function Protected({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <p style={{ padding: 40 }}>Loading…</p>;
  return admin ? children : <Navigate to="/login" replace />;
}
export default function App() {
  return (<Routes>
    <Route path="/" element={<Landing />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/find-seat" element={<FindSeat />} />
    <Route element={<Protected><Layout /></Protected>}><Route path="/dashboard" element={<Dashboard />} /><Route path="/students" element={<Students />} /><Route path="/rooms" element={<Rooms />} /><Route path="/exams" element={<Examinations />} /><Route path="/generate" element={<Generate />} /></Route>
    <Route path="*" element={<Navigate to="/" replace />} /></Routes>);
}
