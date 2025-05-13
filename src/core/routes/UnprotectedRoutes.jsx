import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UnprotectedRoute = ({ children }) => {
  const { user_info, loading } = useSelector((state) => state.authentication);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user_info) {
      navigate("/dashboard");
    }
  }, [user_info, , loading, router]);

  if (loading) return <p>Loading...</p>;

  return !user_info ? children : null;
};

export default UnprotectedRoute;
