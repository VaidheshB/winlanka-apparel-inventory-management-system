import { useMemo, useState } from "react";
import { Plus, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DNSummary() {
    const navigate = useNavigate();

    // Temporary role. Later this will come from AuthContext/JWT.
    const role = "Storekeeper";

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const dispatchNotes = [
        {
            id: 2001,
            customer: "Fashion World",
            date: "2026-09-15",
            items: [
                { name: "Basic T-Shirt", quantity: 200, unit: "pcs" },
                { name: "Cotton Fabric", quantity: 100, unit: "m" }
            ]
        },
        {
            id: 2002,
            customer: "Lanka Fashion House",
            date: "2026-09-16",
            items: [
                { name: "Formal Shirt", quantity: 150, unit: "pcs" },
                { name: "Denim Fabric", quantity: 80, unit: "m" }
            ]
        },
        {
            id: 2003,
            customer: "Colombo Apparel",
            date: "2026-09-17",
            items: [
                { name: "Polo Shirt", quantity: 250, unit: "pcs" }
            ]
        },
        {
            id: 2004,
            customer: "Premium Clothing",
            date: "2026-09-18",
            items: [
                { name: "Women's Blouse", quantity: 180, unit: "pcs" },
                { name: "Women's Trousers", quantity: 120, unit: "pcs" }
            ]
        },
        {
            id: 2005,
            customer: "Fashion World",
            date: "2026-09-19",
            items: [
                { name: "Men's Jeans", quantity: 300, unit: "pcs" }
            ]
        }
    ];

    const filteredDispatchNotes = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        if (!search) {
            return dispatchNotes;
        }

        return dispatchNotes.filter((dn) =>
            dn.id.toString().includes(search) ||
            dn.customer.toLowerCase().includes(search) ||
            dn.date.includes(search) ||
            dn.items.some((item) =>
                item.name.toLowerCase().includes(search)
            )
        );
    }, [searchTerm]);

    const totalPages = Math.ceil(
        filteredDispatchNotes.length / itemsPerPage
    );

    const paginatedDispatchNotes = filteredDispatchNotes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleAddDispatchNote = () => {
        navigate("/dispatch-notes/add");
    };

    const handleViewDispatchNote = (id) => {
        console.log("View Dispatch Note:", id);
    };

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Dispatch Note Summary</h1>
                </div>

                {role === "Storekeeper" && (
                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleAddDispatchNote}
                    >
                        <Plus size={18} />
                        Add Dispatch Note
                    </button>
                )}
            </div>

            <div className="table-card">

                <div className="table-toolbar">
                    <div className="search-box">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search by DN ID, customer, date or stock item..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">

                        <thead>
                            <tr>
                                <th>DN ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items Dispatched</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedDispatchNotes.length > 0 ? (
                                paginatedDispatchNotes.map((dn) => (
                                    <tr key={dn.id}>

                                        <td>{dn.id}</td>

                                        <td className="stock-item-name">
                                            {dn.customer}
                                        </td>

                                        <td>{dn.date}</td>

                                        <td>
                                            <div className="grn-item-list">
                                                {dn.items.map((item, index) => (
                                                    <div
                                                        key={`${dn.id}-${index}`}
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
                                                title="View Dispatch Note"
                                                onClick={() =>
                                                    handleViewDispatchNote(
                                                        dn.id
                                                    )
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
                                        No dispatch notes found.
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

export default DNSummary;