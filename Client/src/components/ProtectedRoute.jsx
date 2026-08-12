import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps a page and blocks access unless logged in (and, if allowedRoles is
// given, unless the user's role matches). This mirrors the roleCheck
// middleware on the backend — but remember, this is just UX convenience;
// the REAL enforcement is server-side. A resident faking their way past
// this component would still get a 403 from the API on every request.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
