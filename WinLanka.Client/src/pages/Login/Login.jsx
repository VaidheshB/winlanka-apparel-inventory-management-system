import { useState } from "react";
import clothingImage from "../../assets/clothing.jpg";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        setError("");

        if (!username.trim() || !password.trim()) {
            setError("Please enter your username and password.");
            return;
        }

        // API authentication will be implemented later.
        console.log("Login submitted");
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-header">
                    <h1>WinLanka</h1>
                    <p>Apparel Inventory Management</p>
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
                                setUsername(event.target.value)
                            }
                            placeholder="Enter your username"
                            autoComplete="username"
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
                                setPassword(event.target.value)
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
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
                    >
                        Login
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;