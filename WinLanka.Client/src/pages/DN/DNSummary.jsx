import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Eye,
    X,
    ClipboardList,
    PackageMinus,
    Users,
    Boxes,
    Truck,
    CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    getAllDispatchNotes
} from "../../services/api";

function DNSummary() {
    const navigate = useNavigate();

    // Temporary role.
    // Later this will come from AuthContext/JWT.
    const role = "Storekeeper";

    const [dispatchNotes, setDispatchNotes] =
        useState([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [selectedDN, setSelectedDN] =
        useState(null);

    const itemsPerPage = 10;

    // =========================================
    // GET ALL DISPATCH NOTES
    // =========================================

    useEffect(() => {
        const loadDispatchNotes = async () => {
            try {
                setIsLoading(true);
                setError("");

                const data =
                    await getAllDispatchNotes();

                console.log(
                    "Dispatch Notes API response:",
                    data
                );

                const formattedDispatchNotes =
                    data.map((dispatchNote) => ({
                        id:
                            dispatchNote.dispatchNoteId ??
                            dispatchNote.DispatchNoteId,

                        customer:
                            dispatchNote.customer ??
                            dispatchNote.Customer ??
                            "",

                        date:
                            dispatchNote.date ??
                            dispatchNote.Date,

                        items: (
                            dispatchNote.dispatchItems ??
                            dispatchNote.DispatchItems ??
                            []
                        ).map((item) => ({
                            id:
                                item.dispatchItemId ??
                                item.DispatchItemId,

                            stockItemId:
                                item.stockItemId ??
                                item.StockItemId,

                            name:
                                item.stockItem?.stockName ??
                                item.stockItem?.StockName ??
                                item.StockItem?.stockName ??
                                item.StockItem?.StockName ??
                                "",

                            quantity:
                                item.quantity ??
                                item.Quantity,

                            unit:
                                item.stockItem?.unit ??
                                item.stockItem?.Unit ??
                                item.StockItem?.unit ??
                                item.StockItem?.Unit ??
                                ""
                        }))
                    }));

                setDispatchNotes(
                    formattedDispatchNotes
                );
            } catch (error) {
                console.error(
                    "Failed to load Dispatch Notes:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to load Dispatch Notes."
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadDispatchNotes();
    }, []);

    // =========================================
    // DASHBOARD STATISTICS
    // =========================================

    const dashboardStats = useMemo(() => {
        const totalDispatchNotes =
            dispatchNotes.length;

        const totalDispatchedQuantity =
            dispatchNotes.reduce(
                (total, dn) =>
                    total +
                    dn.items.reduce(
                        (sum, item) =>
                            sum +
                            (Number(item.quantity) || 0),
                        0
                    ),
                0
            );

        const totalStockLines =
            dispatchNotes.reduce(
                (total, dn) =>
                    total + dn.items.length,
                0
            );

        const uniqueCustomers =
            new Set(
                dispatchNotes
                    .map((dn) =>
                        dn.customer
                            ?.trim()
                            .toLowerCase()
                    )
                    .filter(Boolean)
            ).size;

        return {
            totalDispatchNotes,
            totalDispatchedQuantity,
            totalStockLines,
            uniqueCustomers
        };
    }, [dispatchNotes]);

    // =========================================
    // CUSTOMER DISTRIBUTION
    // =========================================

    const customerStats = useMemo(() => {
        const customerMap = {};

        dispatchNotes.forEach((dn) => {
            const customer =
                dn.customer?.trim() ||
                "Unknown Customer";

            customerMap[customer] =
                (customerMap[customer] || 0) + 1;
        });

        return Object.entries(customerMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [dispatchNotes]);

    const maxCustomerCount =
        customerStats.length > 0
            ? Math.max(
                ...customerStats.map(
                    ([, count]) => count
                )
            )
            : 1;

    // =========================================
    // UNIT DISTRIBUTION
    // =========================================

    const unitStats = useMemo(() => {
        const unitMap = {};

        dispatchNotes.forEach((dn) => {
            dn.items.forEach((item) => {
                const unit =
                    item.unit?.trim() ||
                    "Unknown";

                const quantity =
                    Number(item.quantity) || 0;

                unitMap[unit] =
                    (unitMap[unit] || 0) +
                    quantity;
            });
        });

        return Object.entries(unitMap)
            .sort((a, b) => b[1] - a[1]);
    }, [dispatchNotes]);

    const totalUnitQuantity =
        unitStats.reduce(
            (total, [, quantity]) =>
                total + quantity,
            0
        );

    // =========================================
    // RECENT DISPATCH NOTES
    // =========================================

    const recentDispatchNotes =
        useMemo(() => {
            return [...dispatchNotes]
                .sort(
                    (a, b) =>
                        new Date(b.date) -
                        new Date(a.date)
                )
                .slice(0, 5);
        }, [dispatchNotes]);

    // =========================================
    // SEARCH
    // =========================================

    const filteredDispatchNotes =
        useMemo(() => {
            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            if (!search) {
                return dispatchNotes;
            }

            return dispatchNotes.filter((dn) =>
                dn.id
                    .toString()
                    .includes(search) ||

                dn.customer
                    .toLowerCase()
                    .includes(search) ||

                dn.date
                    ?.toString()
                    .includes(search) ||

                dn.items.some((item) =>
                    item.name
                        .toLowerCase()
                        .includes(search)
                )
            );
        }, [
            searchTerm,
            dispatchNotes
        ]);

    // =========================================
    // PAGINATION
    // =========================================

    const totalPages =
        Math.ceil(
            filteredDispatchNotes.length /
            itemsPerPage
        );

    const paginatedDispatchNotes =
        filteredDispatchNotes.slice(
            (currentPage - 1) *
                itemsPerPage,

            currentPage *
                itemsPerPage
        );

    // =========================================
    // HANDLERS
    // =========================================

    const handleSearch = (event) => {
        setSearchTerm(
            event.target.value
        );

        setCurrentPage(1);
    };

    const handleAddDispatchNote = () => {
        navigate(
            "/dispatch-notes/add"
        );
    };

    const handleViewDispatchNote = (dn) => {
        setSelectedDN(dn);
    };

    const handleCloseModal = () => {
        setSelectedDN(null);
    };

    // =========================================
    // FORMAT DATE
    // =========================================

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return date.split("T")[0];
    };

    // =========================================
    // RENDER
    // =========================================

    return (
        <div className="page-container">

            {/* ========================================= */}
            {/* PAGE HEADER */}
            {/* ========================================= */}

            <div className="page-header dn-page-header">

                <div className="page-title-group">

                    <div className="page-title-icon dn-title-icon">
                        <PackageMinus size={23} />
                    </div>

                    <div>
                        <h1>
                            Dispatch Note Summary
                        </h1>

                        <p>
                            Monitor outgoing stock and
                            dispatched inventory.
                        </p>
                    </div>

                </div>

                {role === "Storekeeper" && (
                    <button
                        type="button"
                        className="primary-button"
                        onClick={
                            handleAddDispatchNote
                        }
                    >
                        <Plus size={18} />
                        Add Dispatch Note
                    </button>
                )}

            </div>

            {/* ========================================= */}
            {/* STATISTICS */}
            {/* ========================================= */}

            <div className="dn-stat-grid">

                {/* Total DN */}

                <div className="dn-stat-card dn-blue">

                    <div className="dn-stat-icon">
                        <ClipboardList size={21} />
                    </div>

                    <div className="dn-stat-content">

                        <span>
                            Total Dispatch Notes
                        </span>

                        <strong>
                            {
                                dashboardStats
                                    .totalDispatchNotes
                            }
                        </strong>

                        <small>
                            Dispatch records
                        </small>

                    </div>

                </div>

                {/* Quantity */}

                <div className="dn-stat-card dn-orange">

                    <div className="dn-stat-icon">
                        <PackageMinus size={21} />
                    </div>

                    <div className="dn-stat-content">

                        <span>
                            Quantity Dispatched
                        </span>

                        <strong>
                            {
                                dashboardStats
                                    .totalDispatchedQuantity
                                    .toLocaleString()
                            }
                        </strong>

                        <small>
                            Across all dispatch notes
                        </small>

                    </div>

                </div>

                {/* Customers */}

                <div className="dn-stat-card dn-green">

                    <div className="dn-stat-icon">
                        <Users size={21} />
                    </div>

                    <div className="dn-stat-content">

                        <span>
                            Customers
                        </span>

                        <strong>
                            {
                                dashboardStats
                                    .uniqueCustomers
                            }
                        </strong>

                        <small>
                            Unique customers
                        </small>

                    </div>

                </div>

                {/* Stock Lines */}

                <div className="dn-stat-card dn-purple">

                    <div className="dn-stat-icon">
                        <Boxes size={21} />
                    </div>

                    <div className="dn-stat-content">

                        <span>
                            Stock Lines
                        </span>

                        <strong>
                            {
                                dashboardStats
                                    .totalStockLines
                            }
                        </strong>

                        <small>
                            Items dispatched
                        </small>

                    </div>

                </div>

            </div>

            {/* ========================================= */}
            {/* ANALYTICS */}
            {/* ========================================= */}

            {!isLoading &&
                !error &&
                dispatchNotes.length > 0 && (

                    <div className="dn-analytics-grid">

                        {/* Customer Activity */}

                        <div className="dashboard-panel">

                            <div className="dashboard-panel-header">

                                <div>
                                    <h2>
                                        Customer Activity
                                    </h2>

                                    <p>
                                        Dispatch notes by customer
                                    </p>
                                </div>

                                <div className="panel-icon">
                                    <Users size={19} />
                                </div>

                            </div>

                            <div className="dn-customer-chart">

                                {customerStats.length > 0 ? (
                                    customerStats.map(
                                        ([customer, count]) => {

                                            const percentage =
                                                (
                                                    count /
                                                    maxCustomerCount
                                                ) * 100;

                                            return (
                                                <div
                                                    className="dn-customer-row"
                                                    key={customer}
                                                >

                                                    <div className="dn-customer-label">

                                                        <span
                                                            title={customer}
                                                        >
                                                            {customer}
                                                        </span>

                                                        <strong>
                                                            {count}
                                                        </strong>

                                                    </div>

                                                    <div className="dn-customer-track">

                                                        <div
                                                            className="dn-customer-fill"
                                                            style={{
                                                                width:
                                                                    `${percentage}%`
                                                            }}
                                                        />

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )
                                ) : (
                                    <div className="analytics-empty">
                                        No customer data available.
                                    </div>
                                )}

                            </div>

                        </div>

                        {/* Quantity By Unit */}

                        <div className="dashboard-panel">

                            <div className="dashboard-panel-header">

                                <div>
                                    <h2>
                                        Dispatched Quantity
                                    </h2>

                                    <p>
                                        Quantity grouped by unit
                                    </p>
                                </div>

                                <div className="panel-icon orange-panel-icon">
                                    <PackageMinus size={19} />
                                </div>

                            </div>

                            <div className="dn-unit-chart">

                                {unitStats.length > 0 ? (
                                    unitStats.map(
                                        ([unit, quantity]) => {

                                            const percentage =
                                                totalUnitQuantity >
                                                0
                                                    ? (
                                                        quantity /
                                                        totalUnitQuantity
                                                    ) * 100
                                                    : 0;

                                            return (
                                                <div
                                                    className="dn-unit-row"
                                                    key={unit}
                                                >

                                                    <div className="dn-unit-info">

                                                        <div className="dn-unit-name">
                                                            <span className="dn-unit-dot" />
                                                            {unit}
                                                        </div>

                                                        <strong>
                                                            {
                                                                quantity.toLocaleString()
                                                            }
                                                        </strong>

                                                    </div>

                                                    <div className="dn-unit-track">

                                                        <div
                                                            className="dn-unit-fill"
                                                            style={{
                                                                width:
                                                                    `${percentage}%`
                                                            }}
                                                        />

                                                    </div>

                                                    <small>
                                                        {
                                                            percentage.toFixed(
                                                                1
                                                            )
                                                        }%
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
            {/* RECENT DISPATCH ACTIVITY */}
            {/* ========================================= */}

            {!isLoading &&
                !error &&
                recentDispatchNotes.length > 0 && (

                    <div className="dn-recent-panel dashboard-panel">

                        <div className="dashboard-panel-header">

                            <div>
                                <h2>
                                    Recent Dispatch Activity
                                </h2>

                                <p>
                                    Latest outgoing stock records
                                </p>
                            </div>

                            <div className="panel-icon orange-panel-icon">
                                <CalendarDays size={19} />
                            </div>

                        </div>

                        <div className="recent-dn-list">

                            {recentDispatchNotes.map((dn) => {

                                const totalItems =
                                    dn.items.length;

                                const totalQuantity =
                                    dn.items.reduce(
                                        (sum, item) =>
                                            sum +
                                            (
                                                Number(
                                                    item.quantity
                                                ) || 0
                                            ),
                                        0
                                    );

                                return (
                                    <div
                                        className="recent-dn-item"
                                        key={dn.id}
                                    >

                                        <div className="recent-dn-icon">
                                            <PackageMinus size={18} />
                                        </div>

                                        <div className="recent-dn-main">

                                            <strong>
                                                DN #{dn.id}
                                            </strong>

                                            <span>
                                                {
                                                    dn.customer ||
                                                    "Unknown Customer"
                                                }
                                            </span>

                                        </div>

                                        <div className="recent-dn-meta">

                                            <span>
                                                {
                                                    formatDate(
                                                        dn.date
                                                    ) || "-"
                                                }
                                            </span>

                                            <small>
                                                {totalItems}{" "}
                                                {
                                                    totalItems === 1
                                                        ? "item"
                                                        : "items"
                                                }{" "}
                                                ·{" "}
                                                {
                                                    totalQuantity.toLocaleString()
                                                }{" "}
                                                dispatched
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

            <div className="table-card dn-table-card">

                <div className="table-section-heading">

                    <div>
                        <h2>
                            Dispatch Notes
                        </h2>

                        <p>
                            Manage and review outgoing
                            inventory records.
                        </p>
                    </div>

                    <div className="table-record-count">
                        {
                            filteredDispatchNotes.length
                        }{" "}
                        {
                            filteredDispatchNotes.length === 1
                                ? "record"
                                : "records"
                        }
                    </div>

                </div>

                {/* Toolbar */}

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

                {/* Error */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Table */}

                <div className="table-wrapper">

                    <table className="data-table dn-data-table">

                        <thead>
                            <tr>

                                <th>
                                    DN ID
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Items Dispatched
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>
                        </thead>

                        <tbody>

                            {isLoading ? (

                                <tr>
                                    <td
                                        colSpan="5"
                                        className="empty-table"
                                    >
                                        Loading dispatch notes...
                                    </td>
                                </tr>

                            ) : paginatedDispatchNotes.length > 0 ? (

                                paginatedDispatchNotes.map(
                                    (dn) => (

                                        <tr
                                            key={dn.id}
                                        >

                                            {/* DN ID */}

                                            <td>

                                                <span className="dn-id-badge">
                                                    DN-{dn.id}
                                                </span>

                                            </td>

                                            {/* Customer */}

                                            <td>

                                                <div className="customer-cell">

                                                    <div className="customer-avatar">
                                                        <Users size={15} />
                                                    </div>

                                                    <span className="stock-item-name">
                                                        {
                                                            dn.customer ||
                                                            "Unknown Customer"
                                                        }
                                                    </span>

                                                </div>

                                            </td>

                                            {/* Date */}

                                            <td>

                                                <span className="dn-date-badge">
                                                    <CalendarDays size={14} />

                                                    {
                                                        formatDate(
                                                            dn.date
                                                        ) || "-"
                                                    }

                                                </span>

                                            </td>

                                            {/* Items */}

                                            <td>

                                                <div className="grn-item-list">

                                                    {dn.items.map(
                                                        (
                                                            item,
                                                            index
                                                        ) => (

                                                            <div
                                                                key={
                                                                    item.id ??
                                                                    `${dn.id}-${index}`
                                                                }
                                                                className="grn-item dn-item"
                                                            >

                                                                <span className="grn-item-name">
                                                                    {
                                                                        item.name
                                                                    }
                                                                </span>

                                                                <span className="dn-item-quantity">
                                                                    {
                                                                        item.quantity
                                                                    }{" "}
                                                                    {
                                                                        item.unit
                                                                    }
                                                                </span>

                                                            </div>
                                                        )
                                                    )}

                                                </div>

                                            </td>

                                            {/* Action */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className="view-button"
                                                    title="View Dispatch Note"
                                                    onClick={() =>
                                                        handleViewDispatchNote(
                                                            dn
                                                        )
                                                    }
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )

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

                {/* Pagination */}

                {totalPages > 1 && (

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
                            Page {currentPage} of{" "}
                            {totalPages}
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

            {/* ========================================= */}
            {/* VIEW DN MODAL */}
            {/* ========================================= */}

            {selectedDN && (

                <div
                    className="modal-overlay"
                    onClick={
                        handleCloseModal
                    }
                >

                    <div
                        className="user-modal grn-view-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* Modal Header */}

                        <div className="modal-header">

                            <div className="modal-title-with-icon">

                                <div className="modal-title-icon dn-modal-icon">
                                    <PackageMinus size={20} />
                                </div>

                                <div>

                                    <h2>
                                        View Dispatch Note
                                    </h2>

                                    <p>
                                        Complete DN information
                                        and dispatched stock items.
                                    </p>

                                </div>

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

                        {/* Modal Body */}

                        <div className="modal-body">

                            {/* DN Summary */}

                            <div className="dn-modal-summary">

                                <div className="dn-modal-summary-card">

                                    <span>
                                        DN ID
                                    </span>

                                    <strong>
                                        #{selectedDN.id}
                                    </strong>

                                </div>

                                <div className="dn-modal-summary-card">

                                    <span>
                                        Date
                                    </span>

                                    <strong>
                                        {
                                            formatDate(
                                                selectedDN.date
                                            ) || "-"
                                        }
                                    </strong>

                                </div>

                                <div className="dn-modal-summary-card">

                                    <span>
                                        Items
                                    </span>

                                    <strong>
                                        {
                                            selectedDN.items
                                                .length
                                        }
                                    </strong>

                                </div>

                                <div className="dn-modal-summary-card">

                                    <span>
                                        Total Quantity
                                    </span>

                                    <strong>
                                        {
                                            selectedDN.items
                                                .reduce(
                                                    (
                                                        sum,
                                                        item
                                                    ) =>
                                                        sum +
                                                        (
                                                            Number(
                                                                item.quantity
                                                            ) || 0
                                                        ),
                                                    0
                                                )
                                                .toLocaleString()
                                        }
                                    </strong>

                                </div>

                            </div>

                            {/* Customer */}

                            <div className="modal-detail-grid">

                                <div className="modal-detail-item modal-detail-full">

                                    <span>
                                        Customer Name
                                    </span>

                                    <strong>
                                        {
                                            selectedDN.customer
                                        }
                                    </strong>

                                </div>

                            </div>

                            {/* Dispatched Items */}

                            <div className="modal-items-section">

                                <div className="modal-items-header">

                                    <div>

                                        <h3>
                                            Stock Items Dispatched
                                        </h3>

                                        <p>
                                            {
                                                selectedDN
                                                    .items
                                                    .length
                                            }{" "}
                                            {
                                                selectedDN
                                                    .items
                                                    .length === 1
                                                    ? "item"
                                                    : "items"
                                            }{" "}
                                            dispatched in
                                            this DN.
                                        </p>

                                    </div>

                                </div>

                                {/* Items Table */}

                                <div className="modal-items-table-wrapper">

                                    <table className="modal-items-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    #
                                                </th>

                                                <th>
                                                    Stock Item
                                                </th>

                                                <th>
                                                    Quantity
                                                </th>

                                                <th>
                                                    Unit
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {
                                                selectedDN.items.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (

                                                        <tr
                                                            key={
                                                                item.id ??
                                                                `${selectedDN.id}-item-${index}`
                                                            }
                                                        >

                                                            <td>

                                                                <span className="item-number dn-number">
                                                                    {
                                                                        index +
                                                                        1
                                                                    }
                                                                </span>

                                                            </td>

                                                            <td className="modal-table-item-name">
                                                                {
                                                                    item.name
                                                                }
                                                            </td>

                                                            <td>

                                                                <strong>
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </strong>

                                                            </td>

                                                            <td>

                                                                <span className="unit-badge dn-unit-badge">
                                                                    {
                                                                        item.unit
                                                                    }
                                                                </span>

                                                            </td>

                                                        </tr>

                                                    )
                                                )
                                            }

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>

                        {/* Modal Footer */}

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

        </div>
    );
}

export default DNSummary;