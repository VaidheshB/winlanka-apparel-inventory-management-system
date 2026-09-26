import React from "react";
import { NavLink } from "react-router-dom";

import {
    Package,
    FileText,
    Truck,
    Users,
    LogOut
} from "lucide-react";

import clothingImage from "../assets/clothing.jpg";

const Sidebar = ({ roles, onLogout }) => {

    const menuItems = {

        Admin: [
            {
                name: "Users Summary",
                path: "/users",
                icon: Users
            }
        ],

        Storekeeper: [
            {
                name: "Stock Items",
                path: "/stock",
                icon: Package
            },
            {
                name: "Good Received Notes",
                path: "/grn",
                icon: FileText
            },
            {
                name: "Dispatch Notes",
                path: "/dispatch-notes",
                icon: Truck
            },
            {
                name: "Stock Summary",
                path: "/stock-summary",
                icon: Package
            }
        ],

        "Stock Manager": [
            {
                name: "Good Received Notes",
                path: "/grn",
                icon: FileText
            },
            {
                name: "Dispatch Notes",
                path: "/dispatch-notes",
                icon: Truck
            },
            {
                name: "Stock Summary",
                path: "/stock-summary",
                icon: Package
            }
        ]
    };


    /*
     * Combine menus from all scopes.
     *
     * Example:
     *
     * Admin + Storekeeper
     *
     * → Users Summary
     * → Stock Items
     * → GRN
     * → Dispatch Notes
     * → Stock Summary
     */

    const menus = roles
        .flatMap((role) => menuItems[role] || [])
        .filter(
            (menu, index, array) =>
                index ===
                array.findIndex(
                    (item) =>
                        item.path === menu.path
                )
        );


    return (

        <aside className="sidebar">

            {/* Logo */}

            <div className="sidebar-logo">

                <img
                    src={clothingImage}
                    alt="WinLanka"
                />

                <div className="sidebar-logo-text">

                    <h2>
                        WinLanka
                    </h2>

                    <p>
                        Apparel Inventory
                    </p>

                </div>

            </div>


            {/* Navigation */}

            <nav className="sidebar-navigation">

                {menus.map((menu) => {

                    const Icon = menu.icon;

                    return (

                        <NavLink
                            key={menu.path}
                            to={menu.path}
                            className={({ isActive }) =>
                                `sidebar-menu-item ${
                                    isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                        >

                            <Icon size={20} />

                            <span>
                                {menu.name}
                            </span>

                        </NavLink>

                    );

                })}

            </nav>


            {/* Logout */}

            <div className="sidebar-footer">

                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={onLogout}
                >

                    <LogOut size={20} />

                    <span>
                        Logout
                    </span>

                </button>

            </div>

        </aside>
    );
};

export default Sidebar;