import { useMemo, useState } from "react";
import { Eye, PackagePlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function StockItems() {

    const navigate = useNavigate();

    // Temporary role.
    // Later this will come from AuthContext/JWT.
    const role = "Storekeeper";

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Selected stock item for View modal
    const [selectedItem, setSelectedItem] = useState(null);

    const itemsPerPage = 5;

    // Temporary data.
    // Later this will come from the Inventory Azure Function API.
    const stockItems = [
        {
            id: 1,
            name: "Basic T-Shirt",
            category: "Men",
            unit: "pcs",
            reorderLevel: 50
        },
        {
            id: 2,
            name: "Formal Shirt",
            category: "Men",
            unit: "pcs",
            reorderLevel: 30
        },
        {
            id: 3,
            name: "Ladies Blouse",
            category: "Women",
            unit: "pcs",
            reorderLevel: 20
        },
        {
            id: 4,
            name: "Cotton Fabric",
            category: "Casual",
            unit: "m",
            reorderLevel: 100
        },
        {
            id: 5,
            name: "Denim Fabric",
            category: "Casual",
            unit: "m",
            reorderLevel: 80
        },
        {
            id: 6,
            name: "Polo Shirt",
            category: "Men",
            unit: "pcs",
            reorderLevel: 40
        },
        {
            id: 7,
            name: "Women's Trousers",
            category: "Women",
            unit: "pcs",
            reorderLevel: 25
        },
        {
            id: 8,
            name: "Women's Skirt",
            category: "Women",
            unit: "pcs",
            reorderLevel: 15
        },
        {
            id: 9,
            name: "Men's Jeans",
            category: "Men",
            unit: "pcs",
            reorderLevel: 35
        },
        {
            id: 10,
            name: "Linen Fabric",
            category: "Casual",
            unit: "m",
            reorderLevel: 60
        },
        {
            id: 11,
            name: "Sports T-Shirt",
            category: "Men",
            unit: "pcs",
            reorderLevel: 45

        },
        {
            id: 12,
            name: "Cotton Shorts",
            category: "Men",
            unit: "pcs",
            reorderLevel: 20
        },
        {
            id: 13,
            name: "Women's Jacket",
            category: "Women",
            unit: "pcs",
            reorderLevel: 10
        }
    ];

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

    }, [searchTerm]);

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

                {role === "Storekeeper" && (
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

                            {paginatedItems.length > 0 ? (

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