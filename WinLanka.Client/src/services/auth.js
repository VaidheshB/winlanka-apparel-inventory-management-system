import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "currentUser";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:7071/api";

function saveTokens(tokenResponse) {
    const accessToken =
        tokenResponse.accessToken ||
        tokenResponse.AccessToken;

    const refreshToken =
        tokenResponse.refreshToken ||
        tokenResponse.RefreshToken;

    localStorage.setItem(
        ACCESS_TOKEN_KEY,
        accessToken
    );

    localStorage.setItem(
        REFRESH_TOKEN_KEY,
        refreshToken
    );

    const user = getUserFromToken(accessToken);

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
    );
}

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getCurrentUser() {
    const user = localStorage.getItem(USER_KEY);

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}

export function getUserFromToken(token) {
    if (!token || typeof token !== "string") {
        throw new Error("Access token is missing or invalid.");
    }

    const decodedToken = jwtDecode(token);

    const roleClaim =
        decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        decodedToken.role ||
        decodedToken.roles;

    let roles = [];

    if (Array.isArray(roleClaim)) {
        roles = roleClaim;
    }
    else if (roleClaim) {
        roles = [roleClaim];
    }

    return {
        username:
            decodedToken[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ] ||
            decodedToken.unique_name ||
            decodedToken.name,

        roles,

        expiresAt: decodedToken.exp
            ? decodedToken.exp * 1000
            : null
    };
}

export function hasRole(role) {
    const user = getCurrentUser();

    if (!user || !user.roles) {
        return false;
    }

    return user.roles.includes(role);
}

export function hasAnyRole(allowedRoles) {
    const user = getCurrentUser();

    if (!user || !user.roles) {
        return false;
    }

    return allowedRoles.some((role) =>
        user.roles.includes(role)
    );
}

export function isTokenExpired() {
    const token = getAccessToken();

    if (!token) {
        return true;
    }

    try {
        const decodedToken = jwtDecode(token);

        if (!decodedToken.exp) {
            return true;
        }

        return decodedToken.exp * 1000 <= Date.now();

    } catch {
        return true;
    }
}

export async function login(username, password) {
    const response = await fetch(
        `${API_BASE_URL}/oauth/Token`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                userName: username,
                password: password
            })
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error(
                "Invalid Username or Password."
            );
        }

        throw new Error(
            "Unable to login. Please try again."
        );
    }

    const tokenResponse = await response.json();

    console.log("Login API Response:", tokenResponse);

    saveTokens(tokenResponse);

    return getCurrentUser();
}

export async function refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        throw new Error("Refresh token not found.");
    }

    const response = await fetch(
        `${API_BASE_URL}/oauth/refresh`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                refreshToken: refreshToken
            })
        }
    );

    if (!response.ok) {
        logout();

        throw new Error(
            "Session expired. Please login again."
        );
    }

    const tokenResponse = await response.json();

    saveTokens({
        accessToken: tokenResponse.accessToken,

        // Your current backend returns the same refresh token.
        refreshToken:
            tokenResponse.refreshToken || refreshToken
    });

    return getAccessToken();
}

export function logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}