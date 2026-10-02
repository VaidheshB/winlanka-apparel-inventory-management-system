
import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Search,
    Eye,
    Pencil,
    X,
    AlertTriangle
} from "lucide-react";

import {
    getAllStockSummaries,
    updateReorderLevel
} from "../../services/api";

function StockSummary() {

    // =========================================================
    // TEMPORARY ROLE
    // =========================================================
    // Later this can come from AuthContext / JWT.
    const role = "Storekeeper";


    // =========================================================
    // STATE
    // =========================================================

    const [stockSummaries, setStockSummaries] =
        useState([]);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [selectedStock, setSelectedStock] =
        useState(null);

    const [modalType, setModalType] =
        useState(null);

    const [editReorderLevel, setEditReorderLevel] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    // Low-stock alert
    const [showLowStockAlert, setShowLowStockAlert] =
        useState(false);


    const itemsPerPage = 5;


    // =========================================================
    // GET STOCK SUMMARY
    // =========================================================

    const loadStockSummaries = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getAllStockSummaries();

            // Make sure we always work with an array.
            const summaries =
                Array.isArray(data)
                    ? data
                    : [];

            const mappedSummaries =
                summaries.map((stock) => ({
                    id: stock.stockSummaryId,
                    stockItemId: stock.stockItemId,
                    stockName: stock.stockName,
                    category: stock.category,
                    unit: stock.unit,
                    totalReceived: stock.totalReceived,
                    totalDispatched: stock.totalDispatched,
                    availableQuantity: stock.availableQuantity,
                    reorderLevel: stock.reorderLevel,

                    // Prefer backend value.
                    // This also protects the UI if the backend
                    // does not send IsLowStock for some reason.
                    isLowStock:
                        stock.isLowStock ??
                        (
                            stock.availableQuantity <
                            stock.reorderLevel
                        )
                }));

            setStockSummaries(mappedSummaries);

        } catch (err) {

            console.error(
                "Error loading Stock Summary:",
                err
            );

            setError(
                err.message ||
                "Unable to load Stock Summary."
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // LOAD WHEN PAGE OPENS
    // =========================================================

    useEffect(() => {

        loadStockSummaries();

    }, []);


    // =========================================================
    // LOW STOCK ITEMS
    // =========================================================

    const lowStockItems = useMemo(() => {

        return stockSummaries.filter(
            (stock) =>
                stock.availableQuantity <
                stock.reorderLevel
        );

    }, [stockSummaries]);


    // =========================================================
    // SHOW LOW STOCK ALERT
    // =========================================================

    useEffect(() => {

        if (!loading && lowStockItems.length > 0) {
            setShowLowStockAlert(true);
        }

    }, [loading, lowStockItems]);


    // =========================================================
    // SEARCH
    // =========================================================

    const filteredStockSummaries =
        useMemo(() => {

            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            if (!search) {
                return stockSummaries;
            }

            return stockSummaries.filter(
                (stock) =>
                    stock.id
                        .toString()
                        .includes(search) ||

                    stock.stockItemId
                        .toString()
                        .includes(search) ||

                    stock.stockName
                        .toLowerCase()
                        .includes(search)
            );

        }, [
            searchTerm,
            stockSummaries
        ]);


    // =========================================================
    // PAGINATION
    // =========================================================

    const totalPages =
        Math.ceil(
            filteredStockSummaries.length /
            itemsPerPage
        );


    const paginatedStockSummaries =
        filteredStockSummaries.slice(
            (currentPage - 1) *
            itemsPerPage,

            currentPage *
            itemsPerPage
        );


    // =========================================================
    // SEARCH HANDLER
    // =========================================================

    const handleSearch = (event) => {

        setSearchTerm(
            event.target.value
        );

        setCurrentPage(1);
    };


    // =========================================================
    // VIEW STOCK
    // =========================================================

    const handleViewStock = (stock) => {

        setSelectedStock(stock);
        setModalType("view");
    };


    // =========================================================
    // EDIT STOCK
    // =========================================================

    const handleEditStock = (stock) => {

        // Extra protection.
        // Edit should only be possible when
        // available quantity is below reorder level.

        if (
            stock.availableQuantity >=
            stock.reorderLevel
        ) {
            return;
        }

        setSelectedStock(stock);

        setEditReorderLevel(
            stock.reorderLevel.toString()
        );

        setModalType("edit");
    };


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleCloseModal = () => {

        if (saving) {
            return;
        }

        setSelectedStock(null);
        setModalType(null);
        setEditReorderLevel("");
    };


    // =========================================================
    // SAVE REORDER LEVEL
    // =========================================================

    const handleSaveReorderLevel =
        async () => {

            const newReorderLevel =
                Number(editReorderLevel);

            // Validation
            if (
                editReorderLevel === "" ||
                Number.isNaN(newReorderLevel) ||
                !Number.isInteger(newReorderLevel) ||
                newReorderLevel < 0
            ) {
                alert(
                    "Please enter a valid reorder level."
                );

                return;
            }

            if (!selectedStock) {
                return;
            }


            try {

                setSaving(true);


                // =========================================
                // CALL BACKEND
                // =========================================

                await updateReorderLevel(
                    selectedStock.stockItemId,
                    newReorderLevel
                );


                // =========================================
                // UPDATE LOCAL TABLE
                // =========================================

                setStockSummaries(
                    (currentStocks) =>
                        currentStocks.map(
                            (stock) => {

                                if (
                                    stock.stockItemId !==
                                    selectedStock.stockItemId
                                ) {
                                    return stock;
                                }

                                const newIsLowStock =
                                    stock.availableQuantity <
                                    newReorderLevel;

                                return {
                                    ...stock,

                                    reorderLevel:
                                        newReorderLevel,

                                    isLowStock:
                                        newIsLowStock
                                };
                            }
                        )
                );


                // =========================================
                // CLOSE MODAL
                // =========================================

                setSelectedStock(null);
                setModalType(null);
                setEditReorderLevel("");


                // =========================================
                // SUCCESS MESSAGE
                // =========================================

                alert(
                    "Reorder level updated successfully."
                );


                // =========================================
                // OPTIONAL:
                // Reload from backend
                // =========================================

                await loadStockSummaries();

            } catch (err) {

                console.error(
                    "Error updating reorder level:",
                    err
                );

                alert(
                    err.message ||
                    "Unable to update reorder level."
                );

            } finally {

                setSaving(false);
            }
        };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="page-container">


            {/* ================================================= */}
            {/* PAGE HEADER */}
            {/* ================================================= */}

            <div className="page-header">

                <div>

                    <h1>
                        Stock Summary
                    </h1>

                </div>

            </div>


            {/* ================================================= */}
            {/* LOW STOCK ALERT */}
            {/* ================================================= */}

            {showLowStockAlert &&
                lowStockItems.length > 0 && (

                    <div className="stock-alert-box">

                        <div className="stock-alert-icon">
                            <AlertTriangle size={21} />
                        </div>


                        <div className="stock-alert-content">

                            <strong>
                                Low Stock Alert
                            </strong>

                            <p>
                                {lowStockItems.length === 1
                                    ? "The following stock item is below its reorder level:"
                                    : `${lowStockItems.length} stock items are below their reorder levels:`
                                }
                            </p>


                            <ul className="stock-alert-list">

                                {lowStockItems.map((stock) => (
                                    <li key={stock.stockItemId}>

                                        <strong>
                                            {stock.stockName}
                                        </strong>

                                        {" — Available: "}
                                        {stock.availableQuantity}

                                        {" / Reorder Level: "}
                                        {stock.reorderLevel}

                                    </li>
                                ))}

                            </ul>

                        </div>


                        <button
                            type="button"
                            className="stock-alert-close"
                            onClick={() =>
                                setShowLowStockAlert(false)
                            }
                            aria-label="Close low stock alert"
                        >
                            <X size={18} />
                        </button>

                    </div>
                )}




            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}


            {/* ================================================= */}
            {/* TABLE CARD */}
            {/* ================================================= */}

            <div className="table-card">


                {/* ================================================= */}
                {/* SEARCH */}
                {/* ================================================= */}

                <div className="table-toolbar">

                    <div className="search-box">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search by ID or stock item..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />

                    </div>

                </div>


                {/* ================================================= */}
                {/* TABLE */}
                {/* ================================================= */}

                <div className="table-wrapper">

                    <table className="data-table">

                        <thead>

                            <tr>

                                <th>
                                    Stock Summary ID
                                </th>

                                <th>
                                    Stock Item ID
                                </th>
                                <th>
                                    Total Received
                                </th>

                                <th>
                                    Total Dispatched
                                </th>

                                <th>
                                    Available Quantity
                                </th>

                                <th>
                                    Reorder Level
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {/* ===================================== */}
                            {/* LOADING */}
                            {/* ===================================== */}

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="empty-table"
                                    >
                                        Loading Stock Summary...
                                    </td>

                                </tr>

                            ) : paginatedStockSummaries.length > 0 ? (

                                paginatedStockSummaries.map(
                                    (stock) => {

                                        const isLowStock =
                                            stock.availableQuantity <
                                            stock.reorderLevel;

                                        return (

                                            <tr
                                                key={
                                                    stock.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        stock.id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        stock.stockItemId
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        stock.totalReceived
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        stock.totalDispatched
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            isLowStock
                                                                ? "stock-quantity low"
                                                                : "stock-quantity"
                                                        }
                                                    >
                                                        {
                                                            stock.availableQuantity
                                                        }
                                                    </span>

                                                </td>

                                                <td>
                                                    {
                                                        stock.reorderLevel
                                                    }
                                                </td>

                                                <td>

                                                    <div className="action-buttons">


                                                        {/* ================================= */}
                                                        {/* VIEW */}
                                                        {/* ================================= */}

                                                        <button
                                                            type="button"
                                                            className="view-button"
                                                            title="View Stock Summary"
                                                            onClick={() =>
                                                                handleViewStock(
                                                                    stock
                                                                )
                                                            }
                                                        >

                                                            <Eye
                                                                size={16}
                                                            />

                                                            View

                                                        </button>


                                                        {/* ================================= */}
                                                        {/* EDIT */}
                                                        {/* ================================= */}

                                                        {role ===
                                                            "Storekeeper" &&
                                                            isLowStock && (

                                                                <button
                                                                    type="button"
                                                                    className="edit-button"
                                                                    title="Edit Reorder Level"
                                                                    onClick={() =>
                                                                        handleEditStock(
                                                                            stock
                                                                        )
                                                                    }
                                                                >

                                                                    <Pencil
                                                                        size={16}
                                                                    />

                                                                    Edit

                                                                </button>

                                                            )}

                                                    </div>

                                                </td>

                                            </tr>

                                        );
                                    }
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="empty-table"
                                    >
                                        No stock summaries found.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>


                {/* ================================================= */}
                {/* PAGINATION */}
                {/* ================================================= */}

                {!loading &&
                    totalPages > 1 && (

                        <div className="pagination">

                            <button
                                type="button"
                                disabled={
                                    currentPage === 1
                                }
                                onClick={() =>
                                    setCurrentPage(
                                        currentPage - 1
                                    )
                                }
                            >
                                Previous
                            </button>

                            <span>
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={
                                    currentPage ===
                                    totalPages
                                }
                                onClick={() =>
                                    setCurrentPage(
                                        currentPage + 1
                                    )
                                }
                            >
                                Next
                            </button>

                        </div>

                    )}

            </div>


            {/* ================================================= */}
            {/* VIEW STOCK SUMMARY MODAL */}
            {/* ================================================= */}

            {selectedStock &&
                modalType === "view" && (

                    <div
                        className="modal-overlay"
                        onClick={
                            handleCloseModal
                        }
                    >

                        <div
                            className="user-modal stock-summary-view-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >


                            {/* Header */}

                            <div className="modal-header">

                                <div>

                                    <h2>
                                        View Stock Summary
                                    </h2>

                                    <p>
                                        View the current stock information.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={
                                        handleCloseModal
                                    }
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>

                            </div>


                            {/* Body */}

                            <div className="modal-body">

                                <div className="modal-detail-grid">


                                    <div className="modal-detail-item">

                                        <span>
                                            Stock Summary ID
                                        </span>

                                        <strong>
                                            {
                                                selectedStock.id
                                            }
                                        </strong>

                                    </div>


                                    <div className="modal-detail-item">

                                        <span>
                                            Stock Item ID
                                        </span>

                                        <strong>
                                            {
                                                selectedStock.stockItemId
                                            }
                                        </strong>

                                    </div>


                                    <div className="modal-detail-item modal-detail-full">

                                        <span>
                                            Stock Name
                                        </span>

                                        <strong>
                                            {
                                                selectedStock.stockName
                                            }
                                        </strong>

                                    </div>


                                    <div className="modal-detail-item">

                                        <span>
                                            Total Received
                                        </span>

                                        <strong>
                                            {
                                                selectedStock.totalReceived
                                            }
                                        </strong>

                                    </div>


                                    <div className="modal-detail-item">

                                        <span>
                                            Total Dispatched
                                        </span>

                                        <strong>
                                            {
                                                selectedStock.totalDispatched
                                            }
                                        </strong>

                                    </div>


                                    <div className="modal-detail-item">

                                        <span>
                                            Available Quantity
                                        </span>

                                        <strong>
                                            {
                                                selectedStock.availableQuantity
                                            }
                                        </strong>

                                    </div>


                                    <div className="modal-detail-item">

                                        <span>
                                            Reorder Level
                                        </span>

                                        <strong>
                                            {
                                                selectedStock.reorderLevel
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* Low Stock Information */}

                                {selectedStock.availableQuantity <
                                    selectedStock.reorderLevel && (

                                        <div className="stock-alert-box">

                                            <div>

                                                <strong>
                                                    Low Stock
                                                </strong>

                                                <p>
                                                    Available quantity is
                                                    below the reorder level.
                                                </p>

                                            </div>

                                        </div>

                                    )}

                            </div>


                            {/* Footer */}

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        handleCloseModal
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                )}


            {/* ================================================= */}
            {/* EDIT REORDER LEVEL MODAL */}
            {/* ================================================= */}

            {selectedStock &&
                modalType === "edit" && (

                    <div
                        className="modal-overlay"
                        onClick={
                            handleCloseModal
                        }
                    >

                        <div
                            className="user-modal edit-reorder-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >


                            {/* Header */}

                            <div className="modal-header">

                                <div>

                                    <h2>
                                        Edit Reorder Level
                                    </h2>

                                    <p>
                                        Update the minimum stock
                                        level for this item.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={
                                        handleCloseModal
                                    }
                                    aria-label="Close"
                                    disabled={saving}
                                >
                                    <X size={20} />
                                </button>

                            </div>


                            {/* Body */}

                            <div className="modal-body">


                                {/* Stock Information */}

                                <div className="modal-detail-grid">


                                    <div className="modal-detail-item">

                                        <span>
                                            Stock Item ID
                                        </span>

                                        <strong>
                                            {
                                                selectedStock.stockItemId
                                            }
                                        </strong>

                                    </div>


                                    <div className="modal-detail-item">

                                        <span>
                                            Stock Name
                                        </span>

                                        <strong>
                                            {
                                                selectedStock.stockName
                                            }
                                        </strong>

                                    </div>


                                    <div className="modal-detail-item">

                                        <span>
                                            Available Quantity
                                        </span>

                                        <strong>
                                            {
                                                selectedStock.availableQuantity
                                            }
                                        </strong>

                                    </div>


                                    <div className="modal-detail-item">

                                        <span>
                                            Current Reorder Level
                                        </span>

                                        <strong>
                                            {
                                                selectedStock.reorderLevel
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* Edit Section */}

                                <div className="reorder-edit-section">

                                    <label
                                        htmlFor="reorderLevel"
                                        className="reorder-label"
                                    >
                                        New Reorder Level
                                    </label>

                                    <input
                                        id="reorderLevel"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                            editReorderLevel
                                        }
                                        onChange={(event) =>
                                            setEditReorderLevel(
                                                event.target.value
                                            )
                                        }
                                        className="reorder-input"
                                        disabled={saving}
                                    />

                                    <p className="reorder-help-text">
                                        The reorder level is the minimum
                                        quantity at which the stock should
                                        be considered for restocking.
                                    </p>

                                </div>

                            </div>


                            {/* Footer */}

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        handleCloseModal
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="primary-button modal-save-button"
                                    onClick={
                                        handleSaveReorderLevel
                                    }
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
}

export default StockSummary;

