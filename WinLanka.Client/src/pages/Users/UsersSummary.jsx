import { useMemo, useState } from "react";
import { Plus, Search, Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UsersSummary() {

    const navigate = useNavigate();

    // Temporary role.
    // Later this will come from AuthContext/JWT.
    const role = "Admin";

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 5;

    // Temporary data.
    // Later this will come from the User Azure Function API.
    const users = [
        {
            id: 1,
            firstName: "John",
            username: "john.admin",
            isActive: true,
            scopes: ["Admin"]
        },
        {
            id: 2,
            firstName: "Michael",
            username: "michael.store",
            isActive: true,
            scopes: ["Storekeeper"]
        },
        {
            id: 3,
            firstName: "Sarah",
            username: "sarah.manager",
            isActive: true,
            scopes: ["Stock Manager"]
        },
        {
            id: 4,
            firstName: "David",
            username: "david.store",
            isActive: false,
            scopes: ["Storekeeper"]
        },
        {
            id: 5,
            firstName: "Emma",
            username: "emma.admin",
            isActive: true,
            scopes: ["Admin", "Storekeeper"]
        },
        {
            id: 6,
            firstName: "Daniel",
            username: "daniel.manager",
            isActive: true,
            scopes: ["Stock Manager", "Storekeeper"]
        },
        {
            id: 7,
            firstName: "Sophia",
            username: "sophia.store",
            isActive: true,
            scopes: ["Storekeeper"]
        }
    ];

    // Search
    const filteredUsers = useMemo(() => {

        const search = searchTerm.toLowerCase().trim();

        if (!search) {
            return users;
        }

        return users.filter((user) =>
            user.id.toString().includes(search) ||
            user.firstName.toLowerCase().includes(search) ||
            user.username.toLowerCase().includes(search) ||
            user.scopes.some((scope) =>
                scope.toLowerCase().includes(search)
            )
        );

    }, [searchTerm]);

    // Pagination
    const totalPages = Math.ceil(
        filteredUsers.length / itemsPerPage
    );

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleAddUser = () => {
        navigate("/users/add");
    };

    const handleViewUser = (id) => {
        console.log("View user:", id);
    };

    const handleEditUser = (id) => {
        navigate(`/users/edit/${id}`);
    };

    return (
        <div className="page-container">

            {/* Page Header */}
            <div className="page-header">

                <div>
                    <h1>Users Summary</h1>
                </div>

                {/* Admin only */}
                {role === "Admin" && (
                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleAddUser}
                    >
                        <Plus size={18} />
                        Add User
                    </button>
                )}

            </div>


            {/* Search and Table */}
            <div className="table-card">

                <div className="table-toolbar">

                    <div className="search-box">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search by ID, name, username or scope..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />

                    </div>

                </div>


                {/* Table */}
                <div className="table-wrapper">

                    <table className="data-table">

                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>First Name</th>
                                <th>Username</th>
                                <th>Is Active</th>
                                <th>Scopes</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {paginatedUsers.length > 0 ? (

                                paginatedUsers.map((user) => (

                                    <tr key={user.id}>

                                        <td>
                                            {user.id}
                                        </td>

                                        <td className="stock-item-name">
                                            {user.firstName}
                                        </td>

                                        <td>
                                            {user.username}
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    user.isActive
                                                        ? "status-badge active"
                                                        : "status-badge inactive"
                                                }
                                            >
                                                {user.isActive
                                                    ? "Active"
                                                    : "Inactive"
                                                }
                                            </span>

                                        </td>

                                        <td>

                                            <div className="scope-list">

                                                {user.scopes.map(
                                                    (scope) => (
                                                        <span
                                                            key={scope}
                                                            className="scope-badge"
                                                        >
                                                            {scope}
                                                        </span>
                                                    )
                                                )}

                                            </div>

                                        </td>

                                        <td>

                                            <div className="action-buttons">

                                                {/* View */}
                                                <button
                                                    type="button"
                                                    className="view-button"
                                                    title="View User"
                                                    onClick={() =>
                                                        handleViewUser(
                                                            user.id
                                                        )
                                                    }
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>


                                                {/* Edit - Admin only */}
                                                {role === "Admin" && (
                                                    <button
                                                        type="button"
                                                        className="edit-button"
                                                        title="Edit User"
                                                        onClick={() =>
                                                            handleEditUser(
                                                                user.id
                                                            )
                                                        }
                                                    >
                                                        <Pencil size={16} />
                                                        Edit
                                                    </button>
                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td
                                        colSpan="6"
                                        className="empty-table"
                                    >
                                        No users found.
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>


                {/* Pagination */}
                {totalPages > 1 && (

                    <div className="pagination">

                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage(currentPage - 1)
                            }
                        >
                            Previous
                        </button>

                        <span>
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() =>
                                setCurrentPage(currentPage + 1)
                            }
                        >
                            Next
                        </button>

                    </div>

                )}

            </div>

        </div>
    );
}

export default UsersSummary;