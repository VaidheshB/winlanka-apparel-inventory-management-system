import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function MainLayout() {

    // Temporary role.
    // Later this will come from the logged-in user's JWT.
    const role = "Storekeeper";

    const navigate = useNavigate();

    const handleLogout = () => {

        // Later:
        // - Remove JWT
        // - Remove user information
        // - Clear authentication state

        navigate("/login");
    };

    return (
        <div className="app-layout">

            <Sidebar
                role={role}
                onLogout={handleLogout}
            />

            <main className="main-content">
                <Outlet />
            </main>

        </div>
    );
}

export default MainLayout;