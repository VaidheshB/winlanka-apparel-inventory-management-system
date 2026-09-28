import { useMemo, useState, useEffect } from "react";
import {
    Search,
    Eye,
    Pencil,
    UserPlus,
    X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { updateUser, getAllUsers} from "../../services/api";
import { getCurrentUser} from "../../services/auth";

function UsersSummary() {

    const navigate = useNavigate();
    const currentUser = getCurrentUser();
    const isAdmin = currentUser?.roles?.includes("Admin");

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedUser, setSelectedUser] = useState(null);
    const [modalType, setModalType] = useState(null);

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState("");

    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState("");

    const itemsPerPage = 5;

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const loadUsers = async () => {
        try {
            setIsLoadingUsers(true);
            setUsersError("");

            const data =await getAllUsers();
            const formattedUsers =
                data.map((user) => ({
                    id: user.UserId,
                    firstName: user.FirstName || "",
                    lastName: user.LastName || "",
                    username: user.UserName || "",
                    isActive: user.IsActive,
                    scopes: user.Scopes || []
                }));
            setUsers(formattedUsers);

        } catch (error) {
            console.error(
                "Failed to load users:",
                error
            );

            setUsersError(
                error.message ||
                "Unable to load users."
            );

        } finally {
            setIsLoadingUsers(false);
        }
    };


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

        setUpdateError("");
        setIsUpdating(false);
        setModalType("edit");
    };

    // Close modal
    const handleCloseModal = () => {
        if (isUpdating) {
            return;
        }

        setSelectedUser(null);
        setModalType(null);
        setUpdateError("");
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
    const handleSaveChanges = async (event) => {
        event.preventDefault();

        if (!selectedUser) {
            return;
        }

        setUpdateError("");

        // Frontend validation
        if (!selectedUser.firstName.trim()) {
            setUpdateError(
                "First name is required."
            );
            return;
        }

        if (!selectedUser.lastName.trim()) {
            setUpdateError(
                "Last name is required."
            );
            return;
        }

        if (!selectedUser.username.trim()) {
            setUpdateError(
                "Username is required."
            );
            return;
        }

        if (selectedUser.scopes.length === 0) {
            setUpdateError(
                "Select at least one user scope."
            );
            return;
        }

        const userData = {
            firstName:
                selectedUser.firstName.trim(),

            lastName:
                selectedUser.lastName.trim(),

            userName:
                selectedUser.username.trim(),

            scopes:
                selectedUser.scopes,

            isActive:
                selectedUser.isActive
        };

        try {
            setIsUpdating(true);

            console.log(
                "Updating user:",
                {
                    userId: selectedUser.id,
                    ...userData
                }
            );

            const response =
                await updateUser(
                    selectedUser.id,
                    userData
                );

            console.log(
                "Update user response:",
                response
            );

            // Update local table only
            // after backend succeeds.
            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user.id === selectedUser.id
                        ? selectedUser
                        : user
                )
            );

            handleCloseModal();

        } catch (error) {
            console.error(
                "Update user failed:",
                error
            );

            setUpdateError(
                error.message ||
                "Unable to update user. Please try again."
            );

        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="page-container">

            {/* Page Header */}
            <div className="page-header">

                <div>
                    <h1>Users Summary</h1>
                </div>

                {/* Admin only */}
                {isAdmin && (
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

                            {isLoadingUsers ? (

                                <tr>
                                    <td
                                        colSpan="6"
                                        className="empty-table"
                                    >
                                        Loading users...
                                    </td>
                                </tr>

                            ) : usersError ? (

                                <tr>
                                    <td
                                        colSpan="6"
                                        className="empty-table"
                                    >
                                        {usersError}
                                    </td>
                                </tr>

                            ) : paginatedUsers.length > 0 ? (

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
                                                    : "Inactive"}
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

                                                {isAdmin && (
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
                                {updateError && (
                                    <div className="login-error">
                                        {updateError}
                                    </div>
                                )}
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
                                                className={`scope-option ${selectedUser.scopes.includes(scope)
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
                                            className={`toggle-switch ${selectedUser.isActive
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
                                    disabled={isUpdating} >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button form-submit-button"
                                    disabled={isUpdating}>
                                    {isUpdating ? "Saving..." : "Save Changes"}
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