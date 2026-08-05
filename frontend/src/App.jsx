import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import ServiceRequests from "./pages/ServiceRequests";
import ServiceRequestDetail from "./pages/ServiceRequestDetail";
import Agents from "./pages/Agents";
import Loans from "./pages/Loans";
import LoanDetail from "./pages/LoanDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashLoader from "./components/SplashLoader";

function App() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>{splash && <SplashLoader key="splash" />}</AnimatePresence>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
          <Route path="/service-requests" element={<ProtectedRoute><ServiceRequests /></ProtectedRoute>} />
          <Route path="/service-requests/:id" element={<ProtectedRoute><ServiceRequestDetail /></ProtectedRoute>} />
          <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
          <Route path="/loans/:id" element={<ProtectedRoute><LoanDetail /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
