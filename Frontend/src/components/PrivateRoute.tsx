import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";


const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state) => state.auth.token); 

  console.log("Current Token:", token);

  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
