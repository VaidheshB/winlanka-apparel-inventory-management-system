import { getAccessToken, refreshAccessToken, logout } from "./auth";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:7071/api";

const INVENTORY_API_BASE_URL =
    import.meta.env.VITE_INVENTORY_API_BASE_URL ||
    "http://localhost:7239/api";

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
    retry = true,
    baseUrl = API_BASE_URL
) {
    const token = getAccessToken();

    console.log("========== API REQUEST ==========");
    console.log("Base URL:", baseUrl);
    console.log("Endpoint:", endpoint);
    console.log("Full URL:", `${baseUrl}${endpoint}`);
    console.log("Has token:", !!token);
    console.log("Token:", token);
    console.log("Retry:", retry);
    console.log("=================================");

    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (
        options.body &&
        !(options.body instanceof FormData)
    ) {
        headers["Content-Type"] =
            headers["Content-Type"] ||
            "application/json";
    }

    let response;

    try {
        response = await fetch(
            `${baseUrl}${endpoint}`,
            {
                ...options,
                headers
            }
        );

        console.log("========== API RESPONSE ==========");
        console.log("Status:", response.status);
        console.log("Status Text:", response.statusText);
        console.log("URL:", response.url);
        console.log("==================================");

    } catch (error) {

        console.error("========== FETCH ERROR ==========");
        console.error(error);
        console.error("=================================");

        throw error;
    }

    if (
        response.status === 401 &&
        retry
    ) {
        console.log("========== 401 RECEIVED ==========");
        console.log("Attempting token refresh...");
        console.log("==================================");

        try {
            const newAccessToken =
                await getNewAccessToken();

            console.log(
                "New access token received:",
                !!newAccessToken
            );

            return apiFetch(
                endpoint,
                options,
                false,
                baseUrl
            );

        } catch (error) {

            console.error(
                "========== TOKEN REFRESH FAILED =========="
            );

            console.error(error);

            console.error(
                "Logging out and redirecting to login..."
            );

            console.error(
                "==========================================="
            );

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

export async function updateUser(userId, userData) {
    const response = await apiFetch(
        `/users/${userId}`,
        {
            method: "PUT",
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
                  "Unable to update user."
        );
    }

    return data;
}

export async function getAllUsers() {
    const response = await apiFetch(
        "/users",
        {
            method: "GET"
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
                  "Unable to load users."
        );
    }

    return data;
}

export async function getAllStockItems() {
    console.log("========== GET STOCK ITEMS ==========");

    const response = await apiFetch(
        "/stocks",
        {
            method: "GET"
        },
        true,
        INVENTORY_API_BASE_URL
    );

    console.log(
        "Get stock items response:",
        response.status
    );

    const contentType =
        response.headers.get("content-type");

    let data;

    if (
        contentType &&
        contentType.includes("application/json")
    ) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    console.log("Stock items response data:", data);

    if (!response.ok) {
        throw new Error(
            typeof data === "string"
                ? data
                : data.message ||
                  "Unable to load stock items."
        );
    }

    return data;
}

export async function addStockItem(stockItem) {
    const response = await apiFetch(
        "/stocks",
        {
            method: "POST",
            body: JSON.stringify(stockItem)
        },
        true,
        INVENTORY_API_BASE_URL
    );

    const contentType =
        response.headers.get("content-type");

    let data;

    if (
        contentType &&
        contentType.includes("application/json")
    ) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        throw new Error(
            typeof data === "string"
                ? data
                : data.message ||
                  "Unable to add stock item."
        );
    }

    return data;
}

export async function addGoodReceivedNote(grn) {
    const response = await apiFetch(
        "/addgrn",
        {
            method: "POST",
            body: JSON.stringify(grn)
        },
        true,
        INVENTORY_API_BASE_URL
    );

    const contentType =
        response.headers.get("content-type");

    let data;

    if (
        contentType &&
        contentType.includes("application/json")
    ) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        throw new Error(
            typeof data === "string"
                ? data
                : data.message ||
                  "Unable to add Good Received Note."
        );
    }

    return data;
}


export async function getAllGoodReceivedNotes() {
    const response = await apiFetch(
        "/grns",
        {
            method: "GET"
        },
        true,
        INVENTORY_API_BASE_URL
    );

    const contentType =
        response.headers.get("content-type");

    let data;

    if (
        contentType &&
        contentType.includes("application/json")
    ) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        throw new Error(
            typeof data === "string"
                ? data
                : data.message ||
                  "Unable to load Good Received Notes."
        );
    }

    return data;
}

export async function addDispatchNote(dispatchNote) {
    const response = await apiFetch(
        "/adddispatch",
        {
            method: "POST",
            body: JSON.stringify({
                customer: dispatchNote.customer,
                date: dispatchNote.date,
                items: dispatchNote.items.map((item) => ({
                    stockItemId: Number(item.stockItemId),
                    quantity: Number(item.quantity)
                }))
            })
        },
        true,
        INVENTORY_API_BASE_URL
    );

    const contentType =
        response.headers.get("content-type");

    let data;

    if (
        contentType &&
        contentType.includes("application/json")
    ) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        throw new Error(
            typeof data === "string"
                ? data
                : data.message ||
                  "Unable to add Dispatch Note."
        );
    }

    return data;
}


export async function getAllDispatchNotes() {
    const response = await apiFetch(
        "/dispatchnotes",
        {
            method: "GET"
        },
        true,
        INVENTORY_API_BASE_URL
    );

    const contentType =
        response.headers.get("content-type");

    let data;

    if (
        contentType &&
        contentType.includes("application/json")
    ) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        throw new Error(
            typeof data === "string"
                ? data
                : data.message ||
                  "Unable to retrieve Dispatch Notes."
        );
    }

    return data;
}

