import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@/react-app/contexts/AuthContext";
import HomePage from "@/react-app/pages/Home";
import CatalogPage from "@/react-app/pages/Catalog";
import MotorcycleDetailPage from "@/react-app/pages/MotorcycleDetail";
import AdminPage from "@/react-app/pages/Admin";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/motorcycles/:id" element={<MotorcycleDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
