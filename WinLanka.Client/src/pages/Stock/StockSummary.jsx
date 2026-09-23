import { useMemo, useState } from "react";
import { Search, Eye, Pencil, X } from "lucide-react";

function StockSummary() {
    // Temporary role. Later this will come from AuthContext/JWT.
    const role = "Storekeeper";

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Selected stock summary for View/Edit modal
    const [selectedStock, setSelectedStock] = useState(null);
    const [modalType, setModalType] = useState(null);

    // Temporary edit value for reorder level
    const [editReorderLevel, setEditReorderLevel] = useState("");

    const itemsPerPage = 5;

    const [stockSummaries, setStockSummaries] = useState([
        {
            id: 1,
            stockItemId: 101,
            stockName: "Basic T-Shirt",
            totalReceived: 5000,
            totalDispatched: 3200,
            availableQuantity: 1800,
            reorderLevel: 500
        },
        {
            id: 2,
            stockItemId: 102,
            stockName: "Formal Shirt",
            totalReceived: 3000,
            totalDispatched: 2100,
            availableQuantity: 900,
            reorderLevel: 400
        },
        {
            id: 3,
            stockItemId: 103,
            stockName: "Ladies Blouse",
            totalReceived: 2500,
            totalDispatched: 1900,
            availableQuantity: 600,
            reorderLevel: 300
        },
        {
            id: 4,
            stockItemId: 104,
            stockName: "Cotton Fabric",
            totalReceived: 4000,
            totalDispatched: 3500,
            availableQuantity: 500,
            reorderLevel: 800
        },
        {
            id: 5,
            stockItemId: 105,
            stockName: "Denim Fabric",
            totalReceived: 3500,
            totalDispatched: 2200,
            availableQuantity: 1300,
            reorderLevel: 600
        },
        {
            id: 6,
            stockItemId: 106,
            stockName: "Polo Shirt",
            totalReceived: 4500,
            totalDispatched: 3000,
            availableQuantity: 1500,
            reorderLevel: 500
        },
        {
            id: 7,
            stockItemId: 107,
            stockName: "Women's Trousers",
            totalReceived: 2800,
            totalDispatched: 2400,
            availableQuantity: 400,
            reorderLevel: 500
        },
        {
            id: 8,
            stockItemId: 108,
            stockName: "Women's Skirt",
            totalReceived: 2200,
            totalDispatched: 1400,
            availableQuantity: 800,
            reorderLevel: 300
        },
        {
            id: 9,
            stockItemId: 109,
            stockName: "Men's Jeans",
            totalReceived: 3200,
            totalDispatched: 2500,
            availableQuantity: 700,
            reorderLevel: 600
        },
        {
            id: 10,
            stockItemId: 110,
            stockName: "Linen Fabric",
            totalReceived: 2000,
            totalDispatched: 1200,
            availableQuantity: 800,
            reorderLevel: 400
        },
        {
            id: 11,
            stockItemId: 111,
            stockName: "Sports T-Shirt",
            totalReceived: 3500,
            totalDispatched: 2700,
            availableQuantity: 800,
            reorderLevel: 500
        }
    ]);

    const filteredStockSummaries = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        if (!search) {
            return stockSummaries;
        }

        return stockSummaries.filter((stock) =>
            stock.id.toString().includes(search) ||
            stock.stockItemId.toString().includes(search) ||
            stock.stockName.toLowerCase().includes(search)
        );
    }, [searchTerm, stockSummaries]);

    const totalPages = Math.ceil(
        filteredStockSummaries.length / itemsPerPage
    );

    const paginatedStockSummaries = filteredStockSummaries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    // Open View modal
    const handleViewStock = (stock) => {
        setSelectedStock(stock);
        setModalType("view");
    };

    // Open Edit modal
    const handleEditStock = (stock) => {
        setSelectedStock(stock);
        setEditReorderLevel(stock.reorderLevel.toString());
        setModalType("edit");
    };

    // Close modal
    const handleCloseModal = () => {
        setSelectedStock(null);
        setModalType(null);
        setEditReorderLevel("");
    };

    // Save updated reorder level
    const handleSaveReorderLevel = () => {
        const newReorderLevel = Number(editReorderLevel);

        if (
            editReorderLevel === "" ||
            Number.isNaN(newReorderLevel) ||
            newReorderLevel < 0
        ) {
            return;
        }

        setStockSummaries((currentStocks) =>
            currentStocks.map((stock) =>
                stock.id === selectedStock.id
                    ? {
                          ...stock,
                          reorderLevel: newReorderLevel
                      }
                    : stock
            )
        );

        handleCloseModal();
    };

    return (
        <div className="page-container">

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Stock Summary</h1>
                </div>
            </div>

            {/* Table */}
            <div className="table-card">

                {/* Search */}
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

                {/* Stock Summary Table */}
                <div className="table-wrapper">

                    <table className="data-table">

                        <thead>
                            <tr>
                                <th>Stock Summary ID</th>
                                <th>Stock Item ID</th>
                                <th>Stock Name</th>
                                <th>Total Received</th>
                                <th>Total Dispatched</th>
                                <th>Available Quantity</th>
                                <th>Reorder Level</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {paginatedStockSummaries.length > 0 ? (
                                paginatedStockSummaries.map((stock) => {

                                    const isLowStock =
                                        stock.availableQuantity <=
                                        stock.reorderLevel;

                                    return (
                                        <tr key={stock.id}>

                                            <td>
                                                {stock.id}
                                            </td>

                                            <td>
                                                {stock.stockItemId}
                                            </td>

                                            <td className="stock-item-name">
                                                {stock.stockName}
                                            </td>

                                            <td>
                                                {stock.totalReceived}
                                            </td>

                                            <td>
                                                {stock.totalDispatched}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        isLowStock
                                                            ? "stock-quantity low"
                                                            : "stock-quantity"
                                                    }
                                                >
                                                    {stock.availableQuantity}
                                                </span>
                                            </td>

                                            <td>
                                                {stock.reorderLevel}
                                            </td>

                                            <td>

                                                <div className="action-buttons">

                                                    {/* View */}
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
                                                        <Eye size={16} />
                                                        View
                                                    </button>

                                                    {/* Edit */}
                                                    {role === "Storekeeper" && (
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
                                                            <Pencil size={16} />
                                                            Edit
                                                        </button>
                                                    )}

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                })
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


            {/* ================================================= */}
            {/* VIEW STOCK SUMMARY MODAL */}
            {/* ================================================= */}

            {selectedStock && modalType === "view" && (

                <div
                    className="modal-overlay"
                    onClick={handleCloseModal}
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
                                onClick={handleCloseModal}
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
                                        {selectedStock.id}
                                    </strong>
                                </div>

                                <div className="modal-detail-item">
                                    <span>
                                        Stock Item ID
                                    </span>

                                    <strong>
                                        {selectedStock.stockItemId}
                                    </strong>
                                </div>

                                <div className="modal-detail-item modal-detail-full">
                                    <span>
                                        Stock Name
                                    </span>

                                    <strong>
                                        {selectedStock.stockName}
                                    </strong>
                                </div>

                                <div className="modal-detail-item">
                                    <span>
                                        Total Received
                                    </span>

                                    <strong>
                                        {selectedStock.totalReceived}
                                    </strong>
                                </div>

                                <div className="modal-detail-item">
                                    <span>
                                        Total Dispatched
                                    </span>

                                    <strong>
                                        {selectedStock.totalDispatched}
                                    </strong>
                                </div>

                                <div className="modal-detail-item">
                                    <span>
                                        Available Quantity
                                    </span>

                                    <strong>
                                        {selectedStock.availableQuantity}
                                    </strong>
                                </div>

                                <div className="modal-detail-item">
                                    <span>
                                        Reorder Level
                                    </span>

                                    <strong>
                                        {selectedStock.reorderLevel}
                                    </strong>
                                </div>

                            </div>


                            {/* Low Stock Information */}
                            {selectedStock.availableQuantity <=
                                selectedStock.reorderLevel && (

                                <div className="stock-alert-box">

                                    <div>
                                        <strong>
                                            Low Stock
                                        </strong>

                                        <p>
                                            Available quantity is at or
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
                                onClick={handleCloseModal}
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

            {selectedStock && modalType === "edit" && (

                <div
                    className="modal-overlay"
                    onClick={handleCloseModal}
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
                                    Update the minimum stock level for
                                    this item.
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


                        {/* Body */}
                        <div className="modal-body">

                            {/* Stock Information */}
                            <div className="modal-detail-grid">

                                <div className="modal-detail-item">
                                    <span>
                                        Stock Item ID
                                    </span>

                                    <strong>
                                        {selectedStock.stockItemId}
                                    </strong>
                                </div>

                                <div className="modal-detail-item">
                                    <span>
                                        Stock Name
                                    </span>

                                    <strong>
                                        {selectedStock.stockName}
                                    </strong>
                                </div>

                                <div className="modal-detail-item">
                                    <span>
                                        Available Quantity
                                    </span>

                                    <strong>
                                        {selectedStock.availableQuantity}
                                    </strong>
                                </div>

                                <div className="modal-detail-item">
                                    <span>
                                        Current Reorder Level
                                    </span>

                                    <strong>
                                        {selectedStock.reorderLevel}
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
                                    value={editReorderLevel}
                                    onChange={(event) =>
                                        setEditReorderLevel(
                                            event.target.value
                                        )
                                    }
                                    className="reorder-input"
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
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="primary-button modal-save-button"
                                onClick={handleSaveReorderLevel}
                            >
                                Save Changes
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default StockSummary;