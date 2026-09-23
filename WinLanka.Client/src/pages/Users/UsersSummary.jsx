import { useMemo, useState } from "react";
import {
    Search,
    Eye,
    Pencil,
    UserPlus,
    X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function UsersSummary() {

    const navigate = useNavigate();

    // Temporary role.
    // Later this will come from AuthContext/JWT.
    const role = "Admin";

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedUser, setSelectedUser] = useState(null);
    const [modalType, setModalType] = useState(null);

    const itemsPerPage = 5;

    // Temporary data.
    // Later this will come from the User Azure Function API.
    const [users, setUsers] = useState([
        {
            id: 1,
            firstName: "John",
            lastName: "Smith",
            username: "john.admin",
            isActive: true,
            scopes: ["Admin"]
        },
        {
            id: 2,
            firstName: "Michael",
            lastName: "Perera",
            username: "michael.store",
            isActive: true,
            scopes: ["Storekeeper"]
        },
        {
            id: 3,
            firstName: "Sarah",
            lastName: "Fernando",
            username: "sarah.manager",
            isActive: true,
            scopes: ["Stock Manager"]
        },
        {
            id: 4,
            firstName: "David",
            lastName: "Silva",
            username: "david.store",
            isActive: false,
            scopes: ["Storekeeper"]
        },
        {
            id: 5,
            firstName: "Emma",
            lastName: "Johnson",
            username: "emma.admin",
            isActive: true,
            scopes: ["Admin", "Storekeeper"]
        },
        {
            id: 6,
            firstName: "Daniel",
            lastName: "Williams",
            username: "daniel.manager",
            isActive: true,
            scopes: ["Stock Manager", "Storekeeper"]
        },
        {
            id: 7,
            firstName: "Sophia",
            lastName: "Brown",
            username: "sophia.store",
            isActive: true,
            scopes: ["Storekeeper"]
        }
    ]);

    const availableScopes = [
        "Admin",
        "Storekeeper",
        "Stock Manager"
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
            user.lastName.toLowerCase().includes(search) ||
            user.username.toLowerCase().includes(search) ||
            user.scopes.some((scope) =>
                scope.toLowerCase().includes(search)
            )
        );

    }, [searchTerm, users]);

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

    // Open View modal
    const handleViewUser = (user) => {
        setSelectedUser(user);
        setModalType("view");
    };

    // Open Edit modal
    const handleEditUser = (user) => {
        setSelectedUser({
            ...user,
            scopes: [...user.scopes]
        });

        setModalType("edit");
    };

    // Close modal
    const handleCloseModal = () => {
        setSelectedUser(null);
        setModalType(null);
    };

    // Handle Edit input changes
    const handleEditChange = (event) => {

        const { name, value } = event.target;

        setSelectedUser((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Handle scope selection in Edit modal
    const handleEditScopeChange = (scope) => {

        setSelectedUser((previous) => {

            const alreadySelected =
                previous.scopes.includes(scope);

            return {
                ...previous,
                scopes: alreadySelected
                    ? previous.scopes.filter(
                        (item) => item !== scope
                    )
                    : [...previous.scopes, scope]
            };
        });
    };

    // Handle active status in Edit modal
    const handleEditActiveChange = () => {

        setSelectedUser((previous) => ({
            ...previous,
            isActive: !previous.isActive
        }));
    };

    // Save edited user
    const handleSaveChanges = (event) => {

        event.preventDefault();

        if (!selectedUser) {
            return;
        }

        setUsers((previousUsers) =>
            previousUsers.map((user) =>
                user.id === selectedUser.id
                    ? selectedUser
                    : user
            )
        );

        console.log("Updated user:", selectedUser);

        // API integration will be added later.
        // PUT /user

        handleCloseModal();
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
                        <UserPlus size={18} />
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
                                                        handleViewUser(user)
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
                                                            handleEditUser(user)
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


            {/* ========================= */}
            {/* VIEW USER MODAL */}
            {/* ========================= */}

            {modalType === "view" && selectedUser && (

                <div
                    className="modal-overlay"
                    onClick={handleCloseModal}
                >

                    <div
                        className="user-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* Modal Header */}
                        <div className="modal-header">

                            <div>
                                <h2>View User</h2>
                                <p>
                                    View the user's account information.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={handleCloseModal}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* Modal Body */}
                        <div className="modal-body">

                            <div className="modal-detail-grid">

                                <div className="modal-detail-item">
                                    <span>User ID</span>
                                    <strong>
                                        {selectedUser.id}
                                    </strong>
                                </div>

                                <div className="modal-detail-item">
                                    <span>Account Status</span>

                                    <strong>
                                        <span
                                            className={
                                                selectedUser.isActive
                                                    ? "status-badge active"
                                                    : "status-badge inactive"
                                            }
                                        >
                                            {selectedUser.isActive
                                                ? "Active"
                                                : "Inactive"
                                            }
                                        </span>
                                    </strong>
                                </div>

                                <div className="modal-detail-item">
                                    <span>First Name</span>
                                    <strong>
                                        {selectedUser.firstName}
                                    </strong>
                                </div>

                                <div className="modal-detail-item">
                                    <span>Last Name</span>
                                    <strong>
                                        {selectedUser.lastName}
                                    </strong>
                                </div>

                                <div className="modal-detail-item modal-detail-full">
                                    <span>Username</span>
                                    <strong>
                                        {selectedUser.username}
                                    </strong>
                                </div>

                            </div>


                            <div className="modal-scope-section">

                                <span className="modal-detail-label">
                                    User Scopes
                                </span>

                                <div className="modal-scope-list">

                                    {selectedUser.scopes.map(
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

                            </div>

                        </div>


                        {/* Modal Footer */}
                        <div className="modal-footer">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={handleCloseModal}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ========================= */}
            {/* EDIT USER MODAL */}
            {/* ========================= */}

            {modalType === "edit" && selectedUser && (

                <div
                    className="modal-overlay"
                    onClick={handleCloseModal}
                >

                    <div
                        className="user-modal edit-user-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* Modal Header */}
                        <div className="modal-header">

                            <div>
                                <h2>Edit User</h2>
                                <p>
                                    Update the user's account information.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={handleCloseModal}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* Edit Form */}
                        <form onSubmit={handleSaveChanges}>

                            <div className="modal-body">

                                <div className="modal-edit-grid">

                                    {/* First Name */}
                                    <div className="form-group">

                                        <label htmlFor="editFirstName">
                                            First Name <span>*</span>
                                        </label>

                                        <input
                                            id="editFirstName"
                                            name="firstName"
                                            type="text"
                                            value={selectedUser.firstName}
                                            onChange={handleEditChange}
                                            required
                                        />

                                    </div>


                                    {/* Last Name */}
                                    <div className="form-group">

                                        <label htmlFor="editLastName">
                                            Last Name <span>*</span>
                                        </label>

                                        <input
                                            id="editLastName"
                                            name="lastName"
                                            type="text"
                                            value={selectedUser.lastName}
                                            onChange={handleEditChange}
                                            required
                                        />

                                    </div>


                                    {/* Username */}
                                    <div className="form-group">

                                        <label htmlFor="editUsername">
                                            Username <span>*</span>
                                        </label>

                                        <input
                                            id="editUsername"
                                            name="username"
                                            type="text"
                                            value={selectedUser.username}
                                            onChange={handleEditChange}
                                            required
                                        />

                                    </div>


                                    {/* User ID */}
                                    <div className="form-group">

                                        <label htmlFor="editUserId">
                                            User ID
                                        </label>

                                        <input
                                            id="editUserId"
                                            type="text"
                                            value={selectedUser.id}
                                            disabled
                                        />

                                    </div>

                                </div>


                                {/* Scopes */}
                                <div className="modal-edit-section">

                                    <div className="form-section-header">
                                        <h2>User Scopes</h2>
                                        <p>
                                            Select one or more scopes for this user.
                                        </p>
                                    </div>

                                    <div className="scope-options">

                                        {availableScopes.map((scope) => (

                                            <label
                                                key={scope}
                                                className={`scope-option ${
                                                    selectedUser.scopes.includes(scope)
                                                        ? "selected"
                                                        : ""
                                                }`}
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={selectedUser.scopes.includes(scope)}
                                                    onChange={() =>
                                                        handleEditScopeChange(scope)
                                                    }
                                                />

                                                <span className="custom-checkbox">
                                                    {selectedUser.scopes.includes(scope) &&
                                                        "✓"}
                                                </span>

                                                <span className="scope-option-content">

                                                    <strong>
                                                        {scope}
                                                    </strong>

                                                    <small>
                                                        {scope === "Admin" &&
                                                            "Manage system users"}

                                                        {scope === "Storekeeper" &&
                                                            "Manage stock, GRNs and dispatch notes"}

                                                        {scope === "Stock Manager" &&
                                                            "View inventory and stock information"}
                                                    </small>

                                                </span>

                                            </label>

                                        ))}

                                    </div>

                                </div>


                                {/* Account Status */}
                                <div className="modal-edit-section">

                                    <div className="form-section-header">
                                        <h2>Account Status</h2>
                                        <p>
                                            Control whether this user can access the system.
                                        </p>
                                    </div>

                                    <div className="active-status-row">

                                        <div>
                                            <strong>
                                                Active Account
                                            </strong>

                                            <p>
                                                {selectedUser.isActive
                                                    ? "The user can access the system."
                                                    : "The user will not be able to access the system."
                                                }
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className={`toggle-switch ${
                                                selectedUser.isActive
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={
                                                handleEditActiveChange
                                            }
                                            aria-label="Toggle account status"
                                            aria-pressed={
                                                selectedUser.isActive
                                            }
                                        >
                                            <span className="toggle-knob" />
                                        </button>

                                    </div>

                                </div>

                            </div>


                            {/* Modal Footer */}
                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button form-submit-button"
                                >
                                    Save Changes
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default UsersSummary;