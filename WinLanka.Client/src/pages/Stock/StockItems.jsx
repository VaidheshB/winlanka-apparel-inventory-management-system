import { useMemo, useState, useEffect } from "react";
import { Eye, PackagePlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllStockItems } from "../../services/api";
import { getCurrentUser } from "../../services/auth";

function StockItems() {

    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    const isStorekeeper = currentUser?.roles?.includes("Storekeeper");

    const isStockManager = currentUser?.roles?.includes("Stock Manager");

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [stockItems, setStockItems] = useState([]);

    const [isLoadingStocks, setIsLoadingStocks] = useState(true);

    const [stocksError, setStocksError] = useState("");

    const loadStockItems = async () => {

    console.log("🚀 STOCK ITEMS PAGE: loadStockItems() STARTED");

    try {
        setIsLoadingStocks(true);
        setStocksError("");

        console.log("🚀 Calling getAllStockItems()...");

        const data = await getAllStockItems();

        console.log("✅ Stock API returned:", data);

        const formattedItems = data.map((item) => ({
            id: item.StockItemId,
            name: item.StockName || "",
            category: item.Category || "",
            unit: item.Unit || "",
            reorderLevel: item.ReorderLevel ?? 0
        }));

        console.log("✅ Formatted items:", formattedItems);

        setStockItems(formattedItems);

    } catch (error) {

        console.error("❌ STOCK ITEMS ERROR");
        console.error("Error:", error);
        console.error("Message:", error?.message);
        console.error("Stack:", error?.stack);

        setStocksError(
            error.message ||
            "Unable to load stock items."
        );

    } finally {

        setIsLoadingStocks(false);

        console.log("🏁 STOCK ITEMS PAGE: loadStockItems() FINISHED");
    }
};

    useEffect(() => {
        loadStockItems();
    }, []);

    const itemsPerPage = 5;

    // Search by ID, name, category, or unit
    const filteredItems = useMemo(() => {

        const search = searchTerm.toLowerCase().trim();

        if (!search) {
            return stockItems;
        }

        return stockItems.filter((item) =>
            item.id.toString().includes(search) ||
            item.name.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search) ||
            item.unit.toLowerCase().includes(search)
        );

    }, [searchTerm, stockItems]);

    // Pagination
    const totalPages = Math.ceil(
        filteredItems.length / itemsPerPage
    );

    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleAddStock = () => {
        navigate("/stock/add");
    };

    // Open View modal
    const handleViewStock = (item) => {
        setSelectedItem(item);
    };

    // Close View modal
    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    return (
        <div className="page-container">

            {/* Page Header */}
            <div className="page-header">

                <div>
                    <h1>Stock Items</h1>
                </div>

                {isStorekeeper && (
                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleAddStock}
                    >
                        <PackagePlus size={18} />
                        Add Stock
                    </button>
                )}

            </div>


            {/* Search and Table */}
            <div className="table-card">

                <div className="table-toolbar">

                    <div className="search-box">

                        <input
                            type="text"
                            placeholder="Search by ID, name, category or unit..."
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
                                <th>Stock Item ID</th>
                                <th>Stock Item</th>
                                <th>Category</th>
                                <th>Unit</th>
                                <th>ReorderLevel</th>
                                <th>Action</th>
                            </tr>

                        </thead>

                        <tbody>
                            {isLoadingStocks ? (

                                <tr>
                                    <td
                                        colSpan="6"
                                        className="empty-table"
                                    >
                                        Loading stock items...
                                    </td>
                                </tr>

                            ) : stocksError ? (

                                <tr>
                                    <td
                                        colSpan="6"
                                        className="empty-table"
                                    >
                                        {stocksError}
                                    </td>
                                </tr>

                            ) : paginatedItems.length > 0 ? (

                                paginatedItems.map((item) => (

                                    <tr key={item.id}>

                                        <td>
                                            {item.id}
                                        </td>

                                        <td className="stock-item-name">
                                            {item.name}
                                        </td>

                                        <td>
                                            {item.category}
                                        </td>

                                        <td>
                                            {item.unit}
                                        </td>

                                        <td>
                                            {item.reorderLevel}
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="view-button"
                                                title="View Stock Item"
                                                onClick={() =>
                                                    handleViewStock(item)
                                                }
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td
                                        colSpan="7"
                                        className="empty-table"
                                    >
                                        No stock items found.
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
            {/* VIEW STOCK ITEM MODAL */}
            {/* ========================= */}

            {selectedItem && (

                <div
                    className="modal-overlay"
                    onClick={handleCloseModal}
                >

                    <div
                        className="user-modal stock-item-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* Modal Header */}
                        <div className="modal-header">

                            <div>
                                <h2>View Stock Item</h2>

                                <p>
                                    View the stock item's information.
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

                                {/* Stock Item ID */}
                                <div className="modal-detail-item">

                                    <span>
                                        Stock Item ID
                                    </span>

                                    <strong>
                                        {selectedItem.id}
                                    </strong>

                                </div>


                                {/* Stock Item */}
                                <div className="modal-detail-item">

                                    <span>
                                        Stock Item
                                    </span>

                                    <strong>
                                        {selectedItem.name}
                                    </strong>

                                </div>


                                {/* Category */}
                                <div className="modal-detail-item">

                                    <span>
                                        Category
                                    </span>

                                    <strong>
                                        {selectedItem.category}
                                    </strong>

                                </div>


                                {/* Unit */}
                                <div className="modal-detail-item">

                                    <span>
                                        Unit
                                    </span>

                                    <strong>
                                        {selectedItem.unit}
                                    </strong>

                                </div>
                                {/* Reorder Level */}
                                <div className="modal-detail-item">
                                    <span>
                                        Reorder Level
                                    </span>
                                    <strong>
                                        {selectedItem.reorderLevel}
                                    </strong>
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

        </div>
    );
}

export default StockItems;