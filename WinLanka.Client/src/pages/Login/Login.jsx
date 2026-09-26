import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clothingImage from "../../assets/clothing.jpg";
import { login } from "../../services/auth";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!username.trim() || !password.trim()) {
            setError(
                "Please enter your username and password."
            );

            return;
        }

        try {
            setIsLoading(true);

            const user = await login(
                username,
                password
            );

            /*
             * Send the user to an appropriate page
             * based on their scopes.
             */

            if (user.roles.includes("Admin")) {
                navigate("/users");
            }
            else if (
                user.roles.includes("Storekeeper")
            ) {
                navigate("/stock");
            }
            else if (
                user.roles.includes("Stock Manager")
            ) {
                navigate("/grn");
            }
            else {
                setError(
                    "Your account does not have a valid scope."
                );
            }

        } catch (error) {
            setError(
                error.message ||
                "Login failed. Please try again."
            );

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-header">

                    <h1>WinLanka</h1>

                    <p>
                        Apparel Inventory Management
                    </p>

                    <img
                        src={clothingImage}
                        alt="WinLanka Apparel"
                        className="login-logo"
                    />

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your username"
                            autoComplete="username"
                            disabled={isLoading}
                        />

                    </div>

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            disabled={isLoading}
                        />

                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;