import { Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import AdminPage from "./pages/AdminPage";
import RequireAdmin from "./components/RequireAdmin";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />

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