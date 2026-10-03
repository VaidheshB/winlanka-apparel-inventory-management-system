import { useMemo, useState, useEffect } from "react";
import {
    Search,
    Eye,
    Pencil,
    UserPlus,
    X,
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    BriefcaseBusiness,
    PackageCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { updateUser, getAllUsers } from "../../services/api";
import { getCurrentUser } from "../../services/auth";

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

            const data = await getAllUsers();

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


    /*
    ============================================================
    DASHBOARD STATISTICS
    ============================================================
    */

    const dashboardStats = useMemo(() => {

        const totalUsers = users.length;

        const activeUsers = users.filter(
            (user) => user.isActive
        ).length;

        const inactiveUsers = users.filter(
            (user) => !user.isActive
        ).length;

        const adminUsers = users.filter(
            (user) => user.scopes.includes("Admin")
        ).length;

        const storekeeperUsers = users.filter(
            (user) => user.scopes.includes("Storekeeper")
        ).length;

        const stockManagerUsers = users.filter(
            (user) => user.scopes.includes("Stock Manager")
        ).length;

        const activePercentage =
            totalUsers > 0
                ? Math.round((activeUsers / totalUsers) * 100)
                : 0;

        return {
            totalUsers,
            activeUsers,
            inactiveUsers,
            adminUsers,
            storekeeperUsers,
            stockManagerUsers,
            activePercentage
        };

    }, [users]);


    /*
    ============================================================
    SCOPE BAR CHART
    ============================================================
    */

    const scopeChart = useMemo(() => {

        const values = [
            {
                name: "Admin",
                count: dashboardStats.adminUsers,
                className: "scope-bar-admin"
            },
            {
                name: "Storekeeper",
                count: dashboardStats.storekeeperUsers,
                className: "scope-bar-storekeeper"
            },
            {
                name: "Stock Manager",
                count: dashboardStats.stockManagerUsers,
                className: "scope-bar-manager"
            }
        ];

        const maximum =
            Math.max(
                ...values.map((item) => item.count),
                1
            );

        return values.map((item) => ({
            ...item,
            percentage:
                (item.count / maximum) * 100
        }));

    }, [dashboardStats]);


    /*
    ============================================================
    SEARCH
    ============================================================
    */

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


    /*
    ============================================================
    PAGINATION
    ============================================================
    */

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


    /*
    ============================================================
    VIEW MODAL
    ============================================================
    */

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setModalType("view");
    };


    /*
    ============================================================
    EDIT MODAL
    ============================================================
    */

    const handleEditUser = (user) => {

        setSelectedUser({
            ...user,
            scopes: [...user.scopes]
        });

        setUpdateError("");
        setIsUpdating(false);
        setModalType("edit");
    };


    /*
    ============================================================
    CLOSE MODAL
    ============================================================
    */

    const handleCloseModal = () => {

        if (isUpdating) {
            return;
        }

        setSelectedUser(null);
        setModalType(null);
        setUpdateError("");
    };


    /*
    ============================================================
    EDIT INPUT
    ============================================================
    */

    const handleEditChange = (event) => {

        const { name, value } = event.target;

        setSelectedUser((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    /*
    ============================================================
    EDIT SCOPES
    ============================================================
    */

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


    /*
    ============================================================
    ACTIVE STATUS
    ============================================================
    */

    const handleEditActiveChange = () => {

        setSelectedUser((previous) => ({
            ...previous,
            isActive: !previous.isActive
        }));
    };


    /*
    ============================================================
    SAVE USER
    ============================================================
    */

    const handleSaveChanges = async (event) => {

        event.preventDefault();

        if (!selectedUser) {
            return;
        }

        setUpdateError("");


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

            const response =
                await updateUser(
                    selectedUser.id,
                    userData
                );

            console.log(
                "Update user response:",
                response
            );


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

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="page-header">

                <div className="page-header-content">

                    <div className="page-title-icon">
                        <Users size={24} />
                    </div>

                    <div>
                        <h1>Users Summary</h1>

                        <p>
                            Manage users, access scopes and account status.
                        </p>
                    </div>

                </div>


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


            {/* ==================================================
                DASHBOARD STATISTICS
            ================================================== */}

            <div className="user-stat-grid">


                {/* TOTAL USERS */}

                <div className="user-stat-card blue">

                    <div className="user-stat-top">

                        <div className="user-stat-icon">
                            <Users size={21} />
                        </div>

                        <span className="user-stat-label">
                            Total Users
                        </span>

                    </div>

                    <div className="user-stat-value">
                        {dashboardStats.totalUsers}
                    </div>

                    <div className="user-stat-footer">
                        Registered system accounts
                    </div>

                </div>


                {/* ACTIVE USERS */}

                <div className="user-stat-card green">

                    <div className="user-stat-top">

                        <div className="user-stat-icon">
                            <UserCheck size={21} />
                        </div>

                        <span className="user-stat-label">
                            Active Users
                        </span>

                    </div>

                    <div className="user-stat-value">
                        {dashboardStats.activeUsers}
                    </div>

                    <div className="user-stat-footer">
                        Currently enabled accounts
                    </div>

                </div>


                {/* INACTIVE USERS */}

                <div className="user-stat-card orange">

                    <div className="user-stat-top">

                        <div className="user-stat-icon">
                            <UserX size={21} />
                        </div>

                        <span className="user-stat-label">
                            Inactive Users
                        </span>

                    </div>

                    <div className="user-stat-value">
                        {dashboardStats.inactiveUsers}
                    </div>

                    <div className="user-stat-footer">
                        Accounts currently disabled
                    </div>

                </div>


                {/* ADMIN */}

                <div className="user-stat-card purple">

                    <div className="user-stat-top">

                        <div className="user-stat-icon">
                            <ShieldCheck size={21} />
                        </div>

                        <span className="user-stat-label">
                            Administrators
                        </span>

                    </div>

                    <div className="user-stat-value">
                        {dashboardStats.adminUsers}
                    </div>

                    <div className="user-stat-footer">
                        Users with admin scope
                    </div>

                </div>

            </div>


            {/* ==================================================
                ANALYTICS PANELS
            ================================================== */}

            <div className="users-analytics-grid">


                {/* ==================================================
                    SCOPE DISTRIBUTION
                ================================================== */}

                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <h2>User Access Overview</h2>

                            <p>
                                Distribution of assigned system scopes
                            </p>

                        </div>

                        <div className="dashboard-panel-icon blue-panel">
                            <BriefcaseBusiness size={19} />
                        </div>

                    </div>


                    <div className="scope-chart">

                        {scopeChart.map((item) => (

                            <div
                                className="scope-chart-row"
                                key={item.name}
                            >

                                <div className="scope-chart-label">

                                    <span>
                                        {item.name}
                                    </span>

                                    <strong>
                                        {item.count}
                                    </strong>

                                </div>


                                <div className="scope-bar-track">

                                    <div
                                        className={`scope-bar-fill ${item.className}`}
                                        style={{
                                            width: `${item.percentage}%`
                                        }}
                                    />

                                </div>

                            </div>

                        ))}

                    </div>


                    <div className="dashboard-panel-note">

                        <span className="note-dot" />

                        A user can have multiple scopes.

                    </div>

                </div>


                {/* ==================================================
                    ACCOUNT STATUS
                ================================================== */}

                <div className="dashboard-panel account-status-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <h2>Account Status</h2>

                            <p>
                                Current user account availability
                            </p>

                        </div>

                        <div className="dashboard-panel-icon orange-panel">
                            <PackageCheck size={19} />
                        </div>

                    </div>


                    <div className="status-dashboard-content">


                        {/* DONUT */}

                        <div
                            className="status-donut"
                            style={{
                                background:
                                    `conic-gradient(
                                        #2563eb 0% ${dashboardStats.activePercentage}%,
                                        #f97316 ${dashboardStats.activePercentage}% 100%
                                    )`
                            }}
                        >

                            <div className="status-donut-inner">

                                <strong>
                                    {dashboardStats.activePercentage}%
                                </strong>

                                <span>
                                    Active
                                </span>

                            </div>

                        </div>


                        {/* LEGEND */}

                        <div className="status-legend">

                            <div className="status-legend-item">

                                <span className="legend-indicator blue" />

                                <div>
                                    <strong>
                                        {dashboardStats.activeUsers}
                                    </strong>

                                    <span>
                                        Active users
                                    </span>
                                </div>

                            </div>


                            <div className="status-legend-item">

                                <span className="legend-indicator orange" />

                                <div>
                                    <strong>
                                        {dashboardStats.inactiveUsers}
                                    </strong>

                                    <span>
                                        Inactive users
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                USER TABLE
            ================================================== */}

            <div className="table-card">

                <div className="table-toolbar">

                    <div>

                        <h2 className="table-section-title">
                            System Users
                        </h2>

                        <p className="table-section-description">
                            View and manage registered users.
                        </p>

                    </div>


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


                {/* TABLE */}

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

                                            <span className="user-id-badge">
                                                #{user.id}
                                            </span>

                                        </td>


                                        <td className="stock-item-name">

                                            {user.firstName}

                                        </td>


                                        <td>

                                            <span className="username-cell">
                                                {user.username}
                                            </span>

                                        </td>


                                        <td>

                                            <span
                                                className={
                                                    user.isActive
                                                        ? "status-badge active"
                                                        : "status-badge inactive"
                                                }
                                            >

                                                <span className="status-dot" />

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


                {/* PAGINATION */}

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


            {/* ==================================================
                VIEW USER MODAL
            ================================================== */}

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
                                                : "Inactive"}
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


            {/* ==================================================
                EDIT USER MODAL
            ================================================== */}

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


                        <form onSubmit={handleSaveChanges}>

                            <div className="modal-body">

                                {updateError && (

                                    <div className="login-error">
                                        {updateError}
                                    </div>

                                )}


                                <div className="modal-edit-grid">


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


                                <div className="modal-edit-section">

                                    <div className="form-section-header">

                                        <h2>
                                            User Scopes
                                        </h2>

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


                                <div className="modal-edit-section">

                                    <div className="form-section-header">

                                        <h2>
                                            Account Status
                                        </h2>

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


                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={handleCloseModal}
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="primary-button form-submit-button"
                                    disabled={isUpdating}
                                >

                                    {isUpdating
                                        ? "Saving..."
                                        : "Save Changes"}

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