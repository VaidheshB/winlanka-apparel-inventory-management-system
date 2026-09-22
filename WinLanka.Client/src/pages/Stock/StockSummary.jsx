import { useMemo, useState } from "react";
import { Search, Eye, Pencil } from "lucide-react";

function StockSummary() {
    // Temporary role. Later this will come from AuthContext/JWT.
    const role = "Storekeeper";

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const stockSummaries = [
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
    ];

    const filteredStockSummaries = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        if (!search) {
            return stockSummaries;
        }

        return stockSummaries.filter((stock) =>
            stock.id.toString().includes(search) ||
            stock.stockItemId.toString().includes(search) ||
            stock.stockName.toLowerCase().includes(search) ||
            stock.category.toLowerCase().includes(search)
        );
    }, [searchTerm]);

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

    const handleViewStock = (id) => {
        console.log("View stock summary:", id);
    };

    const handleEditStock = (id) => {
        console.log("Edit stock summary:", id);
    };

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Stock Summary</h1>
                </div>
            </div>

            <div className="table-card">

                <div className="table-toolbar">
                    <div className="search-box">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search by ID, stock item, name or category..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

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
                                paginatedStockSummaries.map((stock) => (
                                    <tr key={stock.id}>

                                        <td>{stock.id}</td>

                                        <td>{stock.stockItemId}</td>

                                        <td className="stock-item-name">
                                            {stock.stockName}
                                        </td>
                                        <td>{stock.totalReceived}</td>

                                        <td>{stock.totalDispatched}</td>

                                        <td>
                                            <span
                                                className={
                                                    stock.availableQuantity <=
                                                    stock.reorderLevel
                                                        ? "stock-quantity low"
                                                        : "stock-quantity"
                                                }
                                            >
                                                {stock.availableQuantity}
                                            </span>
                                        </td>

                                        <td>{stock.reorderLevel}</td>

                                        <td>
                                            <div className="action-buttons">

                                                <button
                                                    type="button"
                                                    className="view-button"
                                                    title="View Stock Summary"
                                                    onClick={() =>
                                                        handleViewStock(
                                                            stock.id
                                                        )
                                                    }
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>

                                                {role === "Storekeeper" && (
                                                    <button
                                                        type="button"
                                                        className="edit-button"
                                                        title="Edit Stock Summary"
                                                        onClick={() =>
                                                            handleEditStock(
                                                                stock.id
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
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="empty-table"
                                    >
                                        No stock summaries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>

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
        </div>
    );
}

export default StockSummary;