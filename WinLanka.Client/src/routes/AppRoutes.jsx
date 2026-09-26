import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "../pages/Login/Login";
import MainLayout from "../layout/Mainlayout";

import UsersSummary from "../pages/Users/UsersSummary";
import AddUser from "../pages/Users/AddUser";

import StockItems from "../pages/Stock/StockItems";
import AddStock from "../pages/Stock/AddStock";
import StockSummary from "../pages/Stock/StockSummary";

import GRNSummary from "../pages/GRN/GRNSummary";
import AddGRN from "../pages/GRN/AddGRN";

import DNSummary from "../pages/DN/DNSummary";
import AddDN from "../pages/DN/AddDN";

import RoleRoute from "../routes/RoleRoutes";

function AppRoutes() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Login */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Protected application */}
                <Route element={<MainLayout />}>

                    {/* Admin */}
                    <Route element={
                        <RoleRoute
                            allowedRoles={["Admin"]}
                        />
                    }>

                        <Route
                            path="/users"
                            element={<UsersSummary />}
                        />

                        <Route
                            path="/users/add"
                            element={<AddUser />}
                        />

                    </Route>


                    {/* Storekeeper */}
                    <Route element={
                        <RoleRoute
                            allowedRoles={["Storekeeper"]}
                        />
                    }>

                        <Route
                            path="/stock"
                            element={<StockItems />}
                        />

                        <Route
                            path="/stock/add"
                            element={<AddStock />}
                        />

                        <Route
                            path="/grn/add"
                            element={<AddGRN />}
                        />

                        <Route
                            path="/dispatch-notes/add"
                            element={<AddDN />}
                        />

                    </Route>


                    {/* Storekeeper + Stock Manager */}

                    <Route element={
                        <RoleRoute
                            allowedRoles={[
                                "Storekeeper",
                                "Stock Manager"
                            ]}
                        />
                    }>

                        <Route
                            path="/grn"
                            element={<GRNSummary />}
                        />

                        <Route
                            path="/dispatch-notes"
                            element={<DNSummary />}
                        />

                        <Route
                            path="/stock-summary"
                            element={<StockSummary />}
                        />

                    </Route>

                </Route>


                {/* Fallback */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default AppRoutes;