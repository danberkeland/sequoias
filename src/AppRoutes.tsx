import { Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import AdminPage from "./pages/AdminPage";
import SLDCPage from "./pages/SLDCPage";
import CampInfoPage from "./pages/CampInfoPage";
import RequireAdmin from "./components/RequireAdmin";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/sldc" element={<SLDCPage />} />
      <Route path="/campinfo" element={<CampInfoPage />} />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;