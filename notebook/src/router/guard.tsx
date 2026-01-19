import { Navigate, Outlet } from "react-router";
import useUserStore from "../store/user";

const AuthGuard = () => {
    const { role } = useUserStore();
    return role == '管理员' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthGuard