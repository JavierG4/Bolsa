import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/signin";
import Dashboard from "./pages/dashboard";
import Settings from "./pages/settings"
import Watchlist from "./pages/watchlist";
import Prueba from "./pages/prueba";
import Wallet from "./pages/wallet";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirigir raíz al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rutas principales */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portfolio" element={<Settings/>} />
        <Route path="/watchlist" element={<Watchlist/>} />
        <Route path="/wallet" element={<Wallet/>} />
        <Route path="/prueba" element={<Prueba/>} />

        {/* Si se mete otra URL no existente */}
        <Route path="*" element={<h1 className="text-center mt-10 text-xl">404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
