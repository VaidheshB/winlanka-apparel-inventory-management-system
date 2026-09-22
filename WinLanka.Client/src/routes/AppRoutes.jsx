import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import MainLayout from "../layout/Mainlayout";
import UsersSummary from "../pages/Users/UsersSummary";
import StockItems from "../pages/Stock/StockItems";
import GRNSummary from "../pages/GRN/GRNSummary";
import DNSummary from "../pages/DN/DNSummary";
import AddStock from "../pages/Stock/AddStock";
import AddGRN from "../pages/GRN/AddGRN";
import AddUser from "../pages/Users/AddUser";
import AddDN from "../pages/DN/AddDN";
import StockSummary from "../pages/Stock/StockSummary";

function AppRoutes() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    element={<MainLayout />}
                >
                    <Route
                        path="/users"
                        element={<UsersSummary />}
                    />
                    <Route
                        path="/users/add"
                        element={<AddUser />}
                    />
                    <Route
                        path="/stock"
                        element={<StockItems />}
                    />
                    <Route
                        path="/stock-summary"
                        element={<StockSummary />}
                    />
                    <Route
                        path="/stock/add"
                        element={<AddStock />}
                    />
                    <Route
                        path="/grn"
                        element={<GRNSummary />}
                    />
                    <Route
                        path="/grn/add"
                        element={<AddGRN />}
                    />
                    <Route
                        path="/dispatch-notes"
                        element={<DNSummary />}
                    />
                    <Route
                        path="/dispatch-notes/add"
                        element={<AddDN />}
                    />
                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default AppRoutes;