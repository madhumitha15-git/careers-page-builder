
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CareerBuilder from "./pages/CareerBuilder";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PublicCareerPage from "./pages/PublicCareerPage";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default page */}
        <Route
          path="/"
          element={<Navigate to="/signup" replace />}
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Recruiter dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Career page builder */}
        <Route path="/builder" element={<CareerBuilder />} />

        {/* Company settings */}
        <Route path="/settings" element={<Settings />} />

        {/* Public careers page */}
        <Route
          path="/careers/:companySlug/preview"
          element={<PublicCareerPage />}
        />

        <Route
          path="/careers/:companySlug"
          element={<PublicCareerPage />}
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/signup" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
