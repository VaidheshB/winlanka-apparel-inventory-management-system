import { useMemo, useState } from "react";
import { Plus, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

function GRNSummary() {
    const navigate = useNavigate();

    // Temporary role. Later this will come from AuthContext/JWT.
    const role = "Storekeeper";

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const grns = [
        {
            id: 1001,
            supplier: "ABC Textiles",
            date: "2026-09-15",
            items: [
                { name: "Basic T-Shirt", quantity: 500, unit: "pcs" },
                { name: "Cotton Fabric", quantity: 200, unit: "m" }
            ]
        },
        {
            id: 1002,
            supplier: "Lanka Fabrics",
            date: "2026-09-16",
            items: [
                { name: "Formal Shirt", quantity: 250, unit: "pcs" },
                { name: "Linen Fabric", quantity: 150, unit: "m" }
            ]
        },
        {
            id: 1003,
            supplier: "Fashion Materials Ltd",
            date: "2026-09-17",
            items: [
                { name: "Denim Fabric", quantity: 300, unit: "m" }
            ]
        },
        {
            id: 1004,
            supplier: "ABC Textiles",
            date: "2026-09-18",
            items: [
                { name: "Polo Shirt", quantity: 400, unit: "pcs" },
                { name: "Cotton Shorts", quantity: 200, unit: "pcs" }
            ]
        },
        {
            id: 1005,
            supplier: "Premium Garments",
            date: "2026-09-19",
            items: [
                { name: "Women's Blouse", quantity: 300, unit: "pcs" }
            ]
        }
    ];

    const filteredGRNs = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        if (!search) {
            return grns;
        }

        return grns.filter((grn) =>
            grn.id.toString().includes(search) ||
            grn.supplier.toLowerCase().includes(search) ||
            grn.date.includes(search) ||
            grn.items.some((item) =>
                item.name.toLowerCase().includes(search)
            )
        );
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredGRNs.length / itemsPerPage);

    const paginatedGRNs = filteredGRNs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleAddGRN = () => {
        navigate("/grn/add");
    };

    const handleViewGRN = (id) => {
        console.log("View GRN:", id);
    };

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>GRN Summary</h1>
                </div>

                {role === "Storekeeper" && (
                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleAddGRN}
                    >
                        <Plus size={18} />
                        Add Good Received Note
                    </button>
                )}
            </div>

            <div className="table-card">

                <div className="table-toolbar">
                    <div className="search-box">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search by GRN ID, supplier, date or stock item..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">

                        <thead>
                            <tr>
                                <th>GRN ID</th>
                                <th>Supplier</th>
                                <th>Date</th>
                                <th>Items Received</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedGRNs.length > 0 ? (
                                paginatedGRNs.map((grn) => (
                                    <tr key={grn.id}>

                                        <td>{grn.id}</td>

                                        <td className="stock-item-name">
                                            {grn.supplier}
                                        </td>

                                        <td>{grn.date}</td>

                                        <td>
                                            <div className="grn-item-list">
                                                {grn.items.map((item, index) => (
                                                    <div
                                                        key={`${grn.id}-${index}`}
                                                        className="grn-item"
                                                    >
                                                        <span className="grn-item-name">
                                                            {item.name}
                                                        </span>

                                                        <span className="grn-item-quantity">
                                                            {item.quantity} {item.unit}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="view-button"
                                                title="View GRN"
                                                onClick={() =>
                                                    handleViewGRN(grn.id)
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
                                        colSpan="5"
                                        className="empty-table"
                                    >
                                        No GRNs found.
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

export default GRNSummary;