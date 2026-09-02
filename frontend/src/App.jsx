import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Layout from "./components/Layout";
import MySessions from "./pages/MySessions";
import Sessions from "./pages/Sessions";
import SessionRegistrations from "./pages/SessionRegistrations";

function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {

  return (
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        <Route
          path="events"
          element={<Events />}
        />

        <Route
          path="events/:eventId/sessions"
          element={<Sessions />}
        />
        <Route
          path="my-sessions"
          element={<MySessions />}
        />

        <Route
          path="sessions/:sessionId/registrations"
          element={<SessionRegistrations />}
        />

      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;