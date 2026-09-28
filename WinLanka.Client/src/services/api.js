import { getAccessToken, refreshAccessToken, logout } from "./auth";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:7071/api";

let isRefreshing = false;
let refreshPromise = null;

async function getNewAccessToken() {
    if (isRefreshing) {
        return refreshPromise;
    }

    isRefreshing = true;

    refreshPromise = refreshAccessToken()
        .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
        });

    return refreshPromise;
}

export async function apiFetch(
    endpoint,
    options = {},
    retry = true
) {
    const token = getAccessToken();

    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if ( options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] =
            headers["Content-Type"] || "application/json";
    }

    let response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    if (
        response.status === 401 &&
        retry
    ) {
        try {
            const newAccessToken =
                await getNewAccessToken();

            return apiFetch(
                endpoint,
                options,
                false
            );

        } catch (error) {
            logout();

            window.location.href = "/login";

            throw error;
        }
    }

    return response;
}

export async function addUser(userData) {
    const response = await apiFetch(
        "/users",
        {
            method: "POST",

            body: JSON.stringify(userData)
        }
    );

    const contentType =
        response.headers.get("content-type");

    let data;

    if (
        contentType &&
        contentType.includes("application/json")
    ) {
        data = await response.json();
    }
    else {
        data = await response.text();
    }

    if (!response.ok) {
        throw new Error(
            typeof data === "string"
                ? data
                : data.message ||
                  "Unable to create user."
        );
    }

    return data;
}