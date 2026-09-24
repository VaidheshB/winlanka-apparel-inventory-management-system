import React from 'react'
import { NavLink } from "react-router-dom";
import {
    Package,
    FileText,
    Truck,
    Users,
    LogOut
} from "lucide-react";

const Sidebar = ({ role, onLogout }) => {
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
                name: "Users Summary",
                path: "/users",
                icon: Users
            },
            {
                name: "Stock Items",
                path: "/stock",
                icon: Package
            },
            {
                name: "Good Receieved Notes",
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
            },
            {
                name: "Daily Summary",
                path: "/daily-summary",
                icon: Package
            }
        ],

        "Stock Manager": [
             {
                name: "Users Summary",
                path: "/users",
                icon: Users
            },
            {
                name: "Stock Items",
                path: "/stock",
                icon: Package
            },
            {
                name: "Good Receieved Notes",
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
            },
            {
                name: "Daily Summary",
                path: "/daily-summary",
                icon: Package
            }
        ]
    };

    const menus = menuItems[role] || [];

  return (
     <aside className="sidebar">

            {/* Logo */}
            <div className="sidebar-logo">
                <img
                    src="src\assets\clothing.jpg"
                    alt="WinLanka"
                />

                <div className="sidebar-logo-text">
                    <h2>WinLanka</h2>
                    <p>Apparel Inventory</p>
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
                                    isActive ? "active" : ""
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
    
  )
}

export default Sidebar;





