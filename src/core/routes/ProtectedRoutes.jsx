import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user_info, loading } = useSelector((state) => state.authentication);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user_info) {
      navigate("/signin");
    }
  }, [user_info, loading]);

  if (loading) return <p>Loading...</p>; // Show a loader while checking auth

  return user_info ? children : null;
};

export default ProtectedRoute;
