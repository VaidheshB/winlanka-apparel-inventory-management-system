import { Navigate, Outlet, useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";

import {
    getCurrentUser,
    getAccessToken,
    logout
} from "../services/auth";

function MainLayout() {

    const navigate = useNavigate();

    const token = getAccessToken();
    const user = getCurrentUser();


    /*
     * User is not logged in.
     */

    if (!token || !user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    const handleLogout = () => {

        logout();

        navigate(
            "/login",
            { replace: true }
        );
    };


    return (

        <div className="app-layout">

            <Sidebar
                roles={user.roles}
                onLogout={handleLogout}
            />

            <main className="main-content">

                <Outlet />

            </main>

        </div>
    );
}

export default MainLayout;