import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { addUser } from "../../services/api";

function AddUser() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        scopes: [],
        isActive: true
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const availableScopes = [
        "Admin",
        "Storekeeper",
        "Stock Manager"
    ];

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: ""
        }));

        setApiError("");
    };

    const handleScopeChange = (scope) => {
        setFormData((previous) => {
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

        setErrors((previous) => ({
            ...previous,
            scopes: ""
        }));

        setApiError("");
    };

    const handleActiveChange = () => {
        setFormData((previous) => ({
            ...previous,
            isActive: !previous.isActive
        }));

        setApiError("");
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName =
                "First name is required.";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName =
                "Last name is required.";
        }

        if (!formData.username.trim()) {
            newErrors.username =
                "Username is required.";
        }

        if (!formData.password) {
            newErrors.password =
                "Password is required.";
        }
        else if (formData.password.length < 8) {
            newErrors.password =
                "Password must contain at least 8 characters.";
        }
        else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password =
                "Password must contain at least one uppercase letter.";
        }
        else if (!/[a-z]/.test(formData.password)) {
            newErrors.password =
                "Password must contain at least one lowercase letter.";
        }
        else if (!/[0-9]/.test(formData.password)) {
            newErrors.password =
                "Password must contain at least one number.";
        }
        else if (!/[^A-Za-z0-9]/.test(formData.password)) {
            newErrors.password =
                "Password must contain at least one special character.";
        }

        if (formData.scopes.length === 0) {
            newErrors.scopes =
                "Select at least one user scope.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setApiError("");

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);

            const userData = {
                firstName: formData.firstName.trim(),

                lastName: formData.lastName.trim(),

                userName: formData.username.trim(),

                password: formData.password,

                scopes: formData.scopes,

                isActive: formData.isActive
            };

            console.log("Add User Request:", {
                ...userData,
                password: "[HIDDEN]"
            });

            const result = await addUser(userData);

            console.log(
                "Add User Response:",
                result
            );

            navigate("/users");

        } catch (error) {
            console.error(
                "Add User Error:",
                error
            );

            setApiError(
                error.message ||
                "Unable to create user. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (isLoading) {
            return;
        }

        navigate("/users");
    };

    return (
        <div className="page-container">
            <div className="form-page-header">
                <div>
                    <button
                        type="button"
                        className="back-button"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        <ArrowLeft size={18} />
                        Back to Users
                    </button>

                    <h1>Add User</h1>
                </div>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>

                    <div className="form-section">
                        <div className="form-section-header">
                            <h2>User Information</h2>

                            <p>
                                Enter the user's basic account information.
                            </p>
                        </div>

                        <div className="form-grid">

                            <div className="form-group">
                                <label htmlFor="firstName">
                                    First Name <span>*</span>
                                </label>

                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    className={
                                        errors.firstName
                                            ? "input-error"
                                            : ""
                                    }
                                    disabled={isLoading}
                                />

                                {errors.firstName && (
                                    <small className="error-message">
                                        {errors.firstName}
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">
                                    Last Name <span>*</span>
                                </label>

                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                    className={
                                        errors.lastName
                                            ? "input-error"
                                            : ""
                                    }
                                    disabled={isLoading}
                                />

                                {errors.lastName && (
                                    <small className="error-message">
                                        {errors.lastName}
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="username">
                                    Username <span>*</span>
                                </label>

                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                    className={
                                        errors.username
                                            ? "input-error"
                                            : ""
                                    }
                                    disabled={isLoading}
                                />

                                {errors.username && (
                                    <small className="error-message">
                                        {errors.username}
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    Password <span>*</span>
                                </label>

                                <div className="password-input-wrapper">
                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        className={
                                            errors.password
                                                ? "input-error"
                                                : ""
                                        }
                                        disabled={isLoading}
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <small className="error-message">
                                        {errors.password}
                                    </small>
                                )}
                            </div>

                        </div>
                    </div>

                    <div className="form-divider" />

                    <div className="form-section">
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
                                        formData.scopes.includes(scope)
                                            ? "selected"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={
                                            formData.scopes.includes(
                                                scope
                                            )
                                        }
                                        onChange={() =>
                                            handleScopeChange(
                                                scope
                                            )
                                        }
                                        disabled={isLoading}
                                    />

                                    <span className="custom-checkbox">
                                        {formData.scopes.includes(
                                            scope
                                        ) && "✓"}
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

                        {errors.scopes && (
                            <small className="error-message">
                                {errors.scopes}
                            </small>
                        )}
                    </div>

                    <div className="form-divider" />

                    <div className="form-section">
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
                                    {formData.isActive
                                        ? "The user can access the system."
                                        : "The user will not be able to access the system."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className={`toggle-switch ${
                                    formData.isActive
                                        ? "active"
                                        : ""
                                }`}
                                onClick={handleActiveChange}
                                aria-label="Toggle account status"
                                aria-pressed={
                                    formData.isActive
                                }
                                disabled={isLoading}
                            >
                                <span className="toggle-knob" />
                            </button>

                        </div>
                    </div>

                    {apiError && (
                        <div className="error-message">
                            {apiError}
                        </div>
                    )}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button form-submit-button"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Creating..."
                                : "Done"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default AddUser;

