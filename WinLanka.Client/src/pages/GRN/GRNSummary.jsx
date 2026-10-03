import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Eye,
    X,
    ClipboardList,
    PackageCheck,
    Users,
    Boxes,
    Truck,
    CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllGoodReceivedNotes } from "../../services/api";
import { getCurrentUser } from "../../services/auth";

function GRNSummary() {
    const navigate = useNavigate();

    const currentUser = getCurrentUser();

    const isStorekeeper =
        currentUser?.roles?.includes("Storekeeper");

    const [grns, setGRNs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedGRN, setSelectedGRN] = useState(null);

    const itemsPerPage = 10;

    // -----------------------------------------
    // Load GRNs
    // -----------------------------------------

    useEffect(() => {
        const loadGRNs = async () => {
            try {
                setIsLoading(true);
                setError("");

                const data = await getAllGoodReceivedNotes();

                const formattedGRNs = data.map((grn) => ({
                    id: grn.GoodReceivedNoteId,

                    supplier: grn.Supplier || "",

                    date: grn.Date
                        ? grn.Date.split("T")[0]
                        : "",

                    items: (grn.GRNItems || []).map((item) => ({
                        id: item.GRNItemId,

                        stockItemId: item.StockItemId,

                        name:
                            item.StockItem?.StockName || "",

                        quantity: item.Quantity,

                        unit:
                            item.StockItem?.Unit || ""
                    }))
                }));

                setGRNs(formattedGRNs);
            } catch (error) {
                console.error(
                    "Failed to load GRNs:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to load Good Received Notes."
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadGRNs();
    }, []);

    // -----------------------------------------
    // Dashboard Statistics
    // -----------------------------------------

    const dashboardStats = useMemo(() => {
        const totalGRNs = grns.length;

        const totalReceivedQuantity = grns.reduce(
            (total, grn) =>
                total +
                grn.items.reduce(
                    (sum, item) =>
                        sum + (Number(item.quantity) || 0),
                    0
                ),
            0
        );

        const totalStockLines = grns.reduce(
            (total, grn) =>
                total + grn.items.length,
            0
        );

        const uniqueSuppliers = new Set(
            grns
                .map((grn) =>
                    grn.supplier
                        ?.trim()
                        .toLowerCase()
                )
                .filter(Boolean)
        ).size;

        return {
            totalGRNs,
            totalReceivedQuantity,
            totalStockLines,
            uniqueSuppliers
        };
    }, [grns]);

    // -----------------------------------------
    // Supplier Distribution
    // -----------------------------------------

    const supplierStats = useMemo(() => {
        const supplierMap = {};

        grns.forEach((grn) => {
            const supplier =
                grn.supplier?.trim() || "Unknown Supplier";

            supplierMap[supplier] =
                (supplierMap[supplier] || 0) + 1;
        });

        return Object.entries(supplierMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [grns]);

    const maxSupplierCount =
        supplierStats.length > 0
            ? Math.max(
                ...supplierStats.map(
                    ([, count]) => count
                )
            )
            : 1;

    // -----------------------------------------
    // Unit Distribution
    // -----------------------------------------

    const unitStats = useMemo(() => {
        const unitMap = {};

        grns.forEach((grn) => {
            grn.items.forEach((item) => {
                const unit =
                    item.unit?.trim() || "Unknown";

                const quantity =
                    Number(item.quantity) || 0;

                unitMap[unit] =
                    (unitMap[unit] || 0) + quantity;
            });
        });

        return Object.entries(unitMap)
            .sort((a, b) => b[1] - a[1]);
    }, [grns]);

    const totalUnitQuantity = unitStats.reduce(
        (total, [, quantity]) =>
            total + quantity,
        0
    );

    // -----------------------------------------
    // Recent GRNs
    // -----------------------------------------

    const recentGRNs = useMemo(() => {
        return [...grns]
            .sort((a, b) =>
                new Date(b.date) -
                new Date(a.date)
            )
            .slice(0, 5);
    }, [grns]);

    // -----------------------------------------
    // Search
    // -----------------------------------------

    const filteredGRNs = useMemo(() => {
        const search =
            searchTerm
                .toLowerCase()
                .trim();

        if (!search) {
            return grns;
        }

        return grns.filter((grn) =>
            grn.id
                .toString()
                .includes(search) ||

            grn.supplier
                .toLowerCase()
                .includes(search) ||

            grn.date.includes(search) ||

            grn.items.some((item) =>
                item.name
                    .toLowerCase()
                    .includes(search)
            )
        );
    }, [searchTerm, grns]);

    // -----------------------------------------
    // Pagination
    // -----------------------------------------

    const totalPages = Math.ceil(
        filteredGRNs.length /
        itemsPerPage
    );

    const paginatedGRNs =
        filteredGRNs.slice(
            (currentPage - 1) *
                itemsPerPage,

            currentPage *
                itemsPerPage
        );

    // -----------------------------------------
    // Search Handler
    // -----------------------------------------

    const handleSearch = (event) => {
        setSearchTerm(
            event.target.value
        );

        setCurrentPage(1);
    };

    // -----------------------------------------
    // Add GRN
    // -----------------------------------------

    const handleAddGRN = () => {
        navigate("/grn/add");
    };

    // -----------------------------------------
    // View GRN
    // -----------------------------------------

    const handleViewGRN = (grn) => {
        setSelectedGRN(grn);
    };

    // -----------------------------------------
    // Close Modal
    // -----------------------------------------

    const handleCloseModal = () => {
        setSelectedGRN(null);
    };

    return (
        <div className="page-container">

            {/* ========================================= */}
            {/* PAGE HEADER */}
            {/* ========================================= */}

            <div className="page-header grn-page-header">

                <div className="page-title-group">

                    <div className="page-title-icon grn-title-icon">
                        <ClipboardList size={23} />
                    </div>

                    <div>
                        <h1>GRN Summary</h1>

                        <p>
                            Monitor incoming stock and
                            received inventory.
                        </p>
                    </div>

                </div>

                {isStorekeeper && (
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

            {/* ========================================= */}
            {/* STATISTICS */}
            {/* ========================================= */}

            <div className="grn-stat-grid">

                {/* Total GRNs */}

                <div className="grn-stat-card grn-blue">

                    <div className="grn-stat-icon">
                        <ClipboardList size={21} />
                    </div>

                    <div className="grn-stat-content">

                        <span>
                            Total GRNs
                        </span>

                        <strong>
                            {dashboardStats.totalGRNs}
                        </strong>

                        <small>
                            Goods received notes
                        </small>

                    </div>

                </div>

                {/* Total Quantity */}

                <div className="grn-stat-card grn-green">

                    <div className="grn-stat-icon">
                        <PackageCheck size={21} />
                    </div>

                    <div className="grn-stat-content">

                        <span>
                            Quantity Received
                        </span>

                        <strong>
                            {dashboardStats.totalReceivedQuantity.toLocaleString()}
                        </strong>

                        <small>
                            Across all GRNs
                        </small>

                    </div>

                </div>

                {/* Suppliers */}

                <div className="grn-stat-card grn-orange">

                    <div className="grn-stat-icon">
                        <Truck size={21} />
                    </div>

                    <div className="grn-stat-content">

                        <span>
                            Suppliers
                        </span>

                        <strong>
                            {dashboardStats.uniqueSuppliers}
                        </strong>

                        <small>
                            Unique suppliers
                        </small>

                    </div>

                </div>

                {/* Stock Lines */}

                <div className="grn-stat-card grn-purple">

                    <div className="grn-stat-icon">
                        <Boxes size={21} />
                    </div>

                    <div className="grn-stat-content">

                        <span>
                            Stock Lines
                        </span>

                        <strong>
                            {dashboardStats.totalStockLines}
                        </strong>

                        <small>
                            Items received
                        </small>

                    </div>

                </div>

            </div>

            {/* ========================================= */}
            {/* ANALYTICS */}
            {/* ========================================= */}

            {!isLoading && !error && grns.length > 0 && (
                <div className="grn-analytics-grid">

                    {/* Supplier Analytics */}

                    <div className="dashboard-panel">

                        <div className="dashboard-panel-header">

                            <div>
                                <h2>
                                    Supplier Activity
                                </h2>

                                <p>
                                    GRNs received from suppliers
                                </p>
                            </div>

                            <div className="panel-icon">
                                <Truck size={19} />
                            </div>

                        </div>

                        <div className="supplier-chart">

                            {supplierStats.length > 0 ? (
                                supplierStats.map(
                                    ([supplier, count]) => {

                                        const percentage =
                                            (count /
                                                maxSupplierCount) *
                                            100;

                                        return (
                                            <div
                                                className="supplier-chart-row"
                                                key={supplier}
                                            >

                                                <div className="supplier-chart-label">

                                                    <span
                                                        title={supplier}
                                                    >
                                                        {supplier}
                                                    </span>

                                                    <strong>
                                                        {count}
                                                    </strong>

                                                </div>

                                                <div className="supplier-bar-track">

                                                    <div
                                                        className="supplier-bar-fill"
                                                        style={{
                                                            width: `${percentage}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>
                                        );
                                    }
                                )
                            ) : (
                                <div className="analytics-empty">
                                    No supplier data available.
                                </div>
                            )}

                        </div>

                    </div>

                    {/* Unit Analytics */}

                    <div className="dashboard-panel">

                        <div className="dashboard-panel-header">

                            <div>
                                <h2>
                                    Received Quantity
                                </h2>

                                <p>
                                    Quantity grouped by unit
                                </p>
                            </div>

                            <div className="panel-icon green-panel-icon">
                                <PackageCheck size={19} />
                            </div>

                        </div>

                        <div className="unit-chart">

                            {unitStats.length > 0 ? (
                                unitStats.map(
                                    ([unit, quantity]) => {

                                        const percentage =
                                            totalUnitQuantity > 0
                                                ? (
                                                    quantity /
                                                    totalUnitQuantity
                                                ) * 100
                                                : 0;

                                        return (
                                            <div
                                                className="unit-chart-row"
                                                key={unit}
                                            >

                                                <div className="unit-chart-info">

                                                    <div className="unit-name">
                                                        <span className="unit-dot" />
                                                        {unit}
                                                    </div>

                                                    <strong>
                                                        {quantity.toLocaleString()}
                                                    </strong>

                                                </div>

                                                <div className="unit-progress-track">

                                                    <div
                                                        className="unit-progress-fill"
                                                        style={{
                                                            width: `${percentage}%`
                                                        }}
                                                    />

                                                </div>

                                                <small>
                                                    {percentage.toFixed(1)}%
                                                </small>

                                            </div>
                                        );
                                    }
                                )
                            ) : (
                                <div className="analytics-empty">
                                    No quantity data available.
                                </div>
                            )}

                        </div>

                    </div>

                </div>
            )}

            {/* ========================================= */}
            {/* RECENT ACTIVITY */}
            {/* ========================================= */}

            {!isLoading && !error && recentGRNs.length > 0 && (
                <div className="grn-recent-panel dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div>
                            <h2>
                                Recent GRN Activity
                            </h2>

                            <p>
                                Latest goods received notes
                            </p>
                        </div>

                        <div className="panel-icon orange-panel-icon">
                            <CalendarDays size={19} />
                        </div>

                    </div>

                    <div className="recent-grn-list">

                        {recentGRNs.map((grn) => {

                            const totalItems =
                                grn.items.length;

                            const totalQuantity =
                                grn.items.reduce(
                                    (sum, item) =>
                                        sum +
                                        (Number(item.quantity) || 0),
                                    0
                                );

                            return (
                                <div
                                    className="recent-grn-item"
                                    key={grn.id}
                                >

                                    <div className="recent-grn-icon">
                                        <ClipboardList size={18} />
                                    </div>

                                    <div className="recent-grn-main">

                                        <strong>
                                            GRN #{grn.id}
                                        </strong>

                                        <span>
                                            {grn.supplier ||
                                                "Unknown Supplier"}
                                        </span>

                                    </div>

                                    <div className="recent-grn-meta">

                                        <span>
                                            {grn.date || "-"}
                                        </span>

                                        <small>
                                            {totalItems}{" "}
                                            {totalItems === 1
                                                ? "item"
                                                : "items"}{" "}
                                            ·{" "}
                                            {totalQuantity.toLocaleString()}{" "}
                                            received
                                        </small>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                </div>
            )}

            {/* ========================================= */}
            {/* TABLE CARD */}
            {/* ========================================= */}

            <div className="table-card grn-table-card">

                <div className="table-section-heading">

                    <div>
                        <h2>
                            Goods Received Notes
                        </h2>

                        <p>
                            Manage and review received inventory records.
                        </p>
                    </div>

                    <div className="table-record-count">
                        {filteredGRNs.length}{" "}
                        {filteredGRNs.length === 1
                            ? "record"
                            : "records"}
                    </div>

                </div>

                {/* Toolbar */}

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

                {/* Error */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Table */}

                <div className="table-wrapper">

                    <table className="data-table grn-data-table">

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

                            {isLoading ? (

                                <tr>
                                    <td
                                        colSpan="5"
                                        className="empty-table"
                                    >
                                        Loading GRNs...
                                    </td>
                                </tr>

                            ) : paginatedGRNs.length > 0 ? (

                                paginatedGRNs.map((grn) => (

                                    <tr key={grn.id}>

                                        <td>
                                            <span className="grn-id-badge">
                                                GRN-{grn.id}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="supplier-cell">

                                                <div className="supplier-avatar">
                                                    <Truck size={15} />
                                                </div>

                                                <span className="stock-item-name">
                                                    {grn.supplier ||
                                                        "Unknown Supplier"}
                                                </span>

                                            </div>
                                        </td>

                                        <td>
                                            <span className="date-badge">
                                                <CalendarDays size={14} />
                                                {grn.date || "-"}
                                            </span>
                                        </td>

                                        <td>

                                            <div className="grn-item-list">

                                                {grn.items.map(
                                                    (item) => (

                                                        <div
                                                            key={`${grn.id}-${item.id}`}
                                                            className="grn-item"
                                                        >

                                                            <span className="grn-item-name">
                                                                {item.name}
                                                            </span>

                                                            <span className="grn-item-quantity">
                                                                {item.quantity}{" "}
                                                                {item.unit}
                                                            </span>

                                                        </div>
                                                    )
                                                )}

                                            </div>

                                        </td>

                                        <td>

                                            <button
                                                type="button"
                                                className="view-button"
                                                title="View GRN"
                                                onClick={() =>
                                                    handleViewGRN(grn)
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

                {/* Pagination */}

                {totalPages > 1 && (

                    <div className="pagination">

                        <button
                            type="button"
                            disabled={currentPage === 1}
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
                                currentPage === totalPages
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

            {/* ========================================= */}
            {/* VIEW GRN MODAL */}
            {/* ========================================= */}

            {selectedGRN && (

                <div
                    className="modal-overlay"
                    onClick={handleCloseModal}
                >

                    <div
                        className="user-modal grn-view-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>

                                <div className="modal-title-with-icon">

                                    <div className="modal-title-icon">
                                        <ClipboardList size={20} />
                                    </div>

                                    <div>
                                        <h2>
                                            View Good Received Note
                                        </h2>

                                        <p>
                                            Complete GRN information
                                            and received stock items.
                                        </p>
                                    </div>

                                </div>

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

                        <div className="modal-body">

                            {/* GRN Summary */}

                            <div className="grn-modal-summary">

                                <div className="grn-modal-summary-card">

                                    <span>
                                        GRN ID
                                    </span>

                                    <strong>
                                        #{selectedGRN.id}
                                    </strong>

                                </div>

                                <div className="grn-modal-summary-card">

                                    <span>
                                        Date
                                    </span>

                                    <strong>
                                        {selectedGRN.date || "-"}
                                    </strong>

                                </div>

                                <div className="grn-modal-summary-card">

                                    <span>
                                        Items
                                    </span>

                                    <strong>
                                        {selectedGRN.items.length}
                                    </strong>

                                </div>

                                <div className="grn-modal-summary-card">

                                    <span>
                                        Total Quantity
                                    </span>

                                    <strong>
                                        {selectedGRN.items
                                            .reduce(
                                                (sum, item) =>
                                                    sum +
                                                    (Number(item.quantity) || 0),
                                                0
                                            )
                                            .toLocaleString()}
                                    </strong>

                                </div>

                            </div>

                            {/* Supplier */}

                            <div className="modal-detail-grid">

                                <div className="modal-detail-item modal-detail-full">

                                    <span>
                                        Supplier Name
                                    </span>

                                    <strong>
                                        {selectedGRN.supplier}
                                    </strong>

                                </div>

                            </div>

                            {/* Received Items */}

                            <div className="modal-items-section">

                                <div className="modal-items-header">

                                    <div>
                                        <h3>
                                            Stock Items Received
                                        </h3>

                                        <p>
                                            {selectedGRN.items.length}{" "}
                                            {selectedGRN.items.length === 1
                                                ? "item"
                                                : "items"}{" "}
                                            received in this GRN.
                                        </p>
                                    </div>

                                </div>

                                <div className="modal-items-table-wrapper">

                                    <table className="modal-items-table">

                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Stock Item</th>
                                                <th>Quantity</th>
                                                <th>Unit</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {selectedGRN.items.map(
                                                (item, index) => (

                                                    <tr
                                                        key={`${selectedGRN.id}-item-${item.id}`}
                                                    >

                                                        <td>
                                                            <span className="item-number">
                                                                {index + 1}
                                                            </span>
                                                        </td>

                                                        <td className="modal-table-item-name">
                                                            {item.name}
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {item.quantity}
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            <span className="unit-badge">
                                                                {item.unit}
                                                            </span>
                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>

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

export default GRNSummary;