import { Navigate, Outlet } from "react-router-dom";
import { hasAnyRole, getAccessToken } from "../services/auth";

function RoleRoute({ allowedRoles }) {

    const token = getAccessToken();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!hasAnyRole(allowedRoles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}

export default RoleRoute;