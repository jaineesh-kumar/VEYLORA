import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";


const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: RootState) => state.auth.token); 

  console.log("Current Token:", token);

  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
