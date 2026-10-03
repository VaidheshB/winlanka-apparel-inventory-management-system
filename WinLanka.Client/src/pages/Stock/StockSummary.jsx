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
    AlertTriangle,
    Package,
    PackageCheck,
    PackageMinus,
    TrendingUp,
    TrendingDown,
    Boxes,
    ShieldCheck,
    Activity,
    ArrowDownToLine,
    ArrowUpFromLine,
    RefreshCw
} from "lucide-react";

import {
    getAllStockSummaries,
    updateReorderLevel
} from "../../services/api";

function StockSummary() {

    // =========================================================
    // TEMPORARY ROLE
    // =========================================================

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

            const summaries =
                Array.isArray(data)
                    ? data
                    : [];

            const mappedSummaries =
                summaries.map((stock) => {

                    const availableQuantity =
                        Number(stock.availableQuantity) || 0;

                    const reorderLevel =
                        Number(stock.reorderLevel) || 0;

                    return {

                        id:
                            stock.stockSummaryId,

                        stockItemId:
                            stock.stockItemId,

                        stockName:
                            stock.stockName || "Unknown Stock",

                        category:
                            stock.category || "",

                        unit:
                            stock.unit || "",

                        totalReceived:
                            Number(stock.totalReceived) || 0,

                        totalDispatched:
                            Number(stock.totalDispatched) || 0,

                        availableQuantity,

                        reorderLevel,

                        isLowStock:
                            stock.isLowStock ??
                            (
                                availableQuantity <
                                reorderLevel
                            )
                    };

                });

            setStockSummaries(
                mappedSummaries
            );

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

    const lowStockItems =
        useMemo(() => {

            return stockSummaries.filter(
                (stock) =>
                    stock.availableQuantity <
                    stock.reorderLevel
            );

        }, [stockSummaries]);


    // =========================================================
    // HEALTHY STOCK ITEMS
    // =========================================================

    const healthyStockItems =
        useMemo(() => {

            return stockSummaries.filter(
                (stock) =>
                    stock.availableQuantity >=
                    stock.reorderLevel
            );

        }, [stockSummaries]);


    // =========================================================
    // DASHBOARD STATISTICS
    // =========================================================

    const dashboardStats =
        useMemo(() => {

            const totalItems =
                stockSummaries.length;

            const totalReceived =
                stockSummaries.reduce(
                    (total, stock) =>
                        total +
                        stock.totalReceived,
                    0
                );

            const totalDispatched =
                stockSummaries.reduce(
                    (total, stock) =>
                        total +
                        stock.totalDispatched,
                    0
                );

            const totalAvailable =
                stockSummaries.reduce(
                    (total, stock) =>
                        total +
                        stock.availableQuantity,
                    0
                );

            const totalReorderLevel =
                stockSummaries.reduce(
                    (total, stock) =>
                        total +
                        stock.reorderLevel,
                    0
                );

            const stockHealthPercentage =
                totalItems > 0
                    ? Math.round(
                        (
                            healthyStockItems.length /
                            totalItems
                        ) * 100
                    )
                    : 0;

            const movementTotal =
                totalReceived +
                totalDispatched;

            const dispatchRate =
                movementTotal > 0
                    ? Math.round(
                        (
                            totalDispatched /
                            movementTotal
                        ) * 100
                    )
                    : 0;

            return {

                totalItems,

                totalReceived,

                totalDispatched,

                totalAvailable,

                totalReorderLevel,

                lowStockCount:
                    lowStockItems.length,

                healthyStockCount:
                    healthyStockItems.length,

                stockHealthPercentage,

                dispatchRate
            };

        }, [
            stockSummaries,
            lowStockItems,
            healthyStockItems
        ]);


    // =========================================================
    // INVENTORY STATUS
    // =========================================================

    const stockStatus =
        useMemo(() => {

            const total =
                stockSummaries.length;

            const healthy =
                healthyStockItems.length;

            const low =
                lowStockItems.length;

            return {

                healthy,

                low,

                healthyPercentage:
                    total > 0
                        ? Math.round(
                            (healthy / total) *
                            100
                        )
                        : 0,

                lowPercentage:
                    total > 0
                        ? Math.round(
                            (low / total) *
                            100
                        )
                        : 0
            };

        }, [
            stockSummaries,
            healthyStockItems,
            lowStockItems
        ]);


    // =========================================================
    // INVENTORY MOVEMENT
    // =========================================================

    const movementData =
        useMemo(() => {

            const received =
                dashboardStats.totalReceived;

            const dispatched =
                dashboardStats.totalDispatched;

            const maximum =
                Math.max(
                    received,
                    dispatched,
                    1
                );

            return {

                received,

                dispatched,

                receivedPercentage:
                    Math.round(
                        (received / maximum) *
                        100
                    ),

                dispatchedPercentage:
                    Math.round(
                        (dispatched / maximum) *
                        100
                    )
            };

        }, [dashboardStats]);


    // =========================================================
    // TOP AVAILABLE STOCK
    // =========================================================

    const topAvailableStock =
        useMemo(() => {

            return [...stockSummaries]
                .sort(
                    (a, b) =>
                        b.availableQuantity -
                        a.availableQuantity
                )
                .slice(0, 5);

        }, [stockSummaries]);


    // =========================================================
    // MOST DISPATCHED STOCK
    // =========================================================

    const mostDispatchedStock =
        useMemo(() => {

            return [...stockSummaries]
                .sort(
                    (a, b) =>
                        b.totalDispatched -
                        a.totalDispatched
                )
                .slice(0, 5);

        }, [stockSummaries]);


    // =========================================================
    // LOW STOCK SEVERITY
    // =========================================================

    const lowStockSeverity =
        useMemo(() => {

            return [...lowStockItems]
                .map((stock) => {

                    const shortage =
                        Math.max(
                            stock.reorderLevel -
                            stock.availableQuantity,
                            0
                        );

                    return {
                        ...stock,
                        shortage
                    };

                })
                .sort(
                    (a, b) =>
                        b.shortage -
                        a.shortage
                )
                .slice(0, 5);

        }, [lowStockItems]);


    // =========================================================
    // SHOW LOW STOCK ALERT
    // =========================================================

    useEffect(() => {

        if (
            !loading &&
            lowStockItems.length > 0
        ) {
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
                        ?.toString()
                        .includes(search) ||

                    stock.stockItemId
                        ?.toString()
                        .includes(search) ||

                    stock.stockName
                        ?.toLowerCase()
                        .includes(search) ||

                    stock.category
                        ?.toLowerCase()
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

                await updateReorderLevel(
                    selectedStock.stockItemId,
                    newReorderLevel
                );

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

                setSelectedStock(null);

                setModalType(null);

                setEditReorderLevel("");

                alert(
                    "Reorder level updated successfully."
                );

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
    // REFRESH
    // =========================================================

    const handleRefresh = async () => {

        await loadStockSummaries();
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="stock-summary-page">


            {/* ================================================= */}
            {/* PAGE HEADER */}
            {/* ================================================= */}

            <div className="stock-summary-page-header">

                <div className="page-title-group">

                    <div className="page-title-icon stock-summary-title-icon">
                        <Boxes size={24} />
                    </div>

                    <div>

                        <h1>
                            Stock Summary
                        </h1>

                        <p>
                            Monitor inventory levels, stock movement
                            and restocking requirements.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="stock-refresh-button"
                    onClick={handleRefresh}
                    disabled={loading}
                >

                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "refresh-spinning"
                                : ""
                        }
                    />

                    Refresh

                </button>

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

                            <div className="stock-alert-heading">

                                <strong>
                                    Low Stock Alert
                                </strong>

                                <span>
                                    {lowStockItems.length} item
                                    {lowStockItems.length !== 1
                                        ? "s"
                                        : ""}
                                </span>

                            </div>

                            <p>
                                These items are currently below
                                their configured reorder levels.
                            </p>

                            <div className="stock-alert-items">

                                {lowStockItems
                                    .slice(0, 4)
                                    .map((stock) => (

                                        <div
                                            key={stock.stockItemId}
                                            className="stock-alert-item"
                                        >

                                            <span>
                                                {stock.stockName}
                                            </span>

                                            <strong>
                                                {stock.availableQuantity}
                                                {" / "}
                                                {stock.reorderLevel}
                                            </strong>

                                        </div>

                                    ))}

                            </div>

                            {lowStockItems.length > 4 && (

                                <small>
                                    + {lowStockItems.length - 4}
                                    {" "}more low-stock items
                                </small>

                            )}

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
            {/* KPI CARDS */}
            {/* ================================================= */}

            <div className="stock-summary-stat-grid">

                <div className="stock-summary-stat-card blue">

                    <div className="stock-summary-stat-icon">
                        <Package size={21} />
                    </div>

                    <div className="stock-summary-stat-content">

                        <span>
                            Stock Items
                        </span>

                        <strong>
                            {dashboardStats.totalItems}
                        </strong>

                        <small>
                            Total inventory items
                        </small>

                    </div>

                </div>


                <div className="stock-summary-stat-card green">

                    <div className="stock-summary-stat-icon">
                        <ArrowDownToLine size={21} />
                    </div>

                    <div className="stock-summary-stat-content">

                        <span>
                            Total Received
                        </span>

                        <strong>
                            {dashboardStats.totalReceived}
                        </strong>

                        <small>
                            Units received
                        </small>

                    </div>

                </div>


                <div className="stock-summary-stat-card orange">

                    <div className="stock-summary-stat-icon">
                        <ArrowUpFromLine size={21} />
                    </div>

                    <div className="stock-summary-stat-content">

                        <span>
                            Total Dispatched
                        </span>

                        <strong>
                            {dashboardStats.totalDispatched}
                        </strong>

                        <small>
                            Units dispatched
                        </small>

                    </div>

                </div>


                <div className="stock-summary-stat-card purple">

                    <div className="stock-summary-stat-icon">
                        <Boxes size={21} />
                    </div>

                    <div className="stock-summary-stat-content">

                        <span>
                            Available Stock
                        </span>

                        <strong>
                            {dashboardStats.totalAvailable}
                        </strong>

                        <small>
                            Current quantity
                        </small>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* SECONDARY KPI STRIP */}
            {/* ================================================= */}

            <div className="stock-health-strip">

                <div className="health-strip-item">

                    <div className="health-strip-icon healthy">
                        <ShieldCheck size={18} />
                    </div>

                    <div>

                        <span>
                            Healthy Stock
                        </span>

                        <strong>
                            {dashboardStats.healthyStockCount}
                        </strong>

                    </div>

                </div>


                <div className="health-strip-divider" />


                <div className="health-strip-item">

                    <div className="health-strip-icon warning">
                        <AlertTriangle size={18} />
                    </div>

                    <div>

                        <span>
                            Needs Attention
                        </span>

                        <strong>
                            {dashboardStats.lowStockCount}
                        </strong>

                    </div>

                </div>


                <div className="health-strip-divider" />


                <div className="health-strip-item">

                    <div className="health-strip-icon received">
                        <TrendingUp size={18} />
                    </div>

                    <div>

                        <span>
                            Stock Health
                        </span>

                        <strong>
                            {dashboardStats.stockHealthPercentage}%
                        </strong>

                    </div>

                </div>


                <div className="health-strip-divider" />


                <div className="health-strip-item">

                    <div className="health-strip-icon dispatched">
                        <Activity size={18} />
                    </div>

                    <div>

                        <span>
                            Dispatch Share
                        </span>

                        <strong>
                            {dashboardStats.dispatchRate}%
                        </strong>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* ANALYTICS ROW */}
            {/* ================================================= */}

            <div className="stock-summary-analytics-grid">


                {/* ============================================= */}
                {/* STOCK HEALTH */}
                {/* ============================================= */}

                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <div className="panel-heading">

                                <div className="panel-icon stock-health-panel-icon">
                                    <ShieldCheck size={18} />
                                </div>

                                <div>

                                    <h3>
                                        Inventory Health
                                    </h3>

                                    <p>
                                        Current stock condition
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div className="stock-health-content">

                        <div
                            className="stock-health-donut"
                            style={{
                                background:
                                    `conic-gradient(
                                        #22c55e 0% ${stockStatus.healthyPercentage}%,
                                        #f59e0b ${stockStatus.healthyPercentage}% 100%
                                    )`
                            }}
                        >

                            <div className="stock-health-donut-inner">

                                <strong>
                                    {dashboardStats.stockHealthPercentage}%
                                </strong>

                                <span>
                                    Healthy
                                </span>

                            </div>

                        </div>


                        <div className="stock-health-legend">

                            <div className="health-legend-item">

                                <span className="legend-dot healthy-dot" />

                                <div>

                                    <span>
                                        Healthy
                                    </span>

                                    <strong>
                                        {stockStatus.healthy}
                                    </strong>

                                </div>

                            </div>


                            <div className="health-legend-item">

                                <span className="legend-dot low-dot" />

                                <div>

                                    <span>
                                        Low Stock
                                    </span>

                                    <strong>
                                        {stockStatus.low}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ============================================= */}
                {/* INVENTORY MOVEMENT */}
                {/* ============================================= */}

                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div className="panel-heading">

                            <div className="panel-icon movement-panel-icon">
                                <Activity size={18} />
                            </div>

                            <div>

                                <h3>
                                    Inventory Movement
                                </h3>

                                <p>
                                    Received versus dispatched
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="movement-chart">

                        <div className="movement-row">

                            <div className="movement-label">

                                <span className="movement-dot received-dot" />

                                <span>
                                    Received
                                </span>

                                <strong>
                                    {movementData.received}
                                </strong>

                            </div>

                            <div className="movement-track">

                                <div
                                    className="movement-fill received-fill"
                                    style={{
                                        width:
                                            `${movementData.receivedPercentage}%`
                                    }}
                                />

                            </div>

                        </div>


                        <div className="movement-row">

                            <div className="movement-label">

                                <span className="movement-dot dispatched-dot" />

                                <span>
                                    Dispatched
                                </span>

                                <strong>
                                    {movementData.dispatched}
                                </strong>

                            </div>

                            <div className="movement-track">

                                <div
                                    className="movement-fill dispatched-fill"
                                    style={{
                                        width:
                                            `${movementData.dispatchedPercentage}%`
                                    }}
                                />

                            </div>

                        </div>


                        <div className="movement-summary">

                            <div>

                                <ArrowDownToLine size={15} />

                                <span>
                                    Incoming
                                </span>

                            </div>

                            <div>

                                <ArrowUpFromLine size={15} />

                                <span>
                                    Outgoing
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* SECOND ANALYTICS ROW */}
            {/* ================================================= */}

            <div className="stock-summary-analytics-grid second-row">


                {/* ============================================= */}
                {/* TOP AVAILABLE STOCK */}
                {/* ============================================= */}

                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div className="panel-heading">

                            <div className="panel-icon available-panel-icon">
                                <PackageCheck size={18} />
                            </div>

                            <div>

                                <h3>
                                    Highest Available Stock
                                </h3>

                                <p>
                                    Items with the largest current quantity
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="ranking-list">

                        {topAvailableStock.length > 0 ? (

                            topAvailableStock.map(
                                (stock, index) => (

                                    <div
                                        key={stock.stockItemId}
                                        className="ranking-item"
                                    >

                                        <div className="ranking-number">
                                            {index + 1}
                                        </div>

                                        <div className="ranking-main">

                                            <strong>
                                                {stock.stockName}
                                            </strong>

                                            <span>
                                                ID #{stock.stockItemId}
                                            </span>

                                        </div>

                                        <div className="ranking-value">

                                            <strong>
                                                {stock.availableQuantity}
                                            </strong>

                                            <span>
                                                {stock.unit || "units"}
                                            </span>

                                        </div>

                                    </div>

                                )
                            )

                        ) : (

                            <div className="analytics-empty">
                                No stock data available.
                            </div>

                        )}

                    </div>

                </div>


                {/* ============================================= */}
                {/* MOST DISPATCHED */}
                {/* ============================================= */}

                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div className="panel-heading">

                            <div className="panel-icon dispatched-panel-icon">
                                <PackageMinus size={18} />
                            </div>

                            <div>

                                <h3>
                                    Most Dispatched Stock
                                </h3>

                                <p>
                                    Items with highest outbound movement
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="ranking-list">

                        {mostDispatchedStock.length > 0 ? (

                            mostDispatchedStock.map(
                                (stock, index) => (

                                    <div
                                        key={stock.stockItemId}
                                        className="ranking-item"
                                    >

                                        <div className="ranking-number orange-ranking">
                                            {index + 1}
                                        </div>

                                        <div className="ranking-main">

                                            <strong>
                                                {stock.stockName}
                                            </strong>

                                            <span>
                                                ID #{stock.stockItemId}
                                            </span>

                                        </div>

                                        <div className="ranking-value dispatch-value">

                                            <strong>
                                                {stock.totalDispatched}
                                            </strong>

                                            <span>
                                                {stock.unit || "units"}
                                            </span>

                                        </div>

                                    </div>

                                )
                            )

                        ) : (

                            <div className="analytics-empty">
                                No dispatch data available.
                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* LOW STOCK PRIORITY */}
            {/* ================================================= */}

            {lowStockItems.length > 0 && (

                <div className="dashboard-panel low-stock-priority-panel">

                    <div className="dashboard-panel-header">

                        <div className="panel-heading">

                            <div className="panel-icon low-stock-panel-icon">
                                <AlertTriangle size={18} />
                            </div>

                            <div>

                                <h3>
                                    Restocking Priority
                                </h3>

                                <p>
                                    Items with the largest shortage against reorder level
                                </p>

                            </div>

                        </div>

                        <span className="priority-count">
                            {lowStockItems.length} alerts
                        </span>

                    </div>


                    <div className="priority-list">

                        {lowStockSeverity.map(
                            (stock) => (

                                <div
                                    key={stock.stockItemId}
                                    className="priority-item"
                                >

                                    <div className="priority-item-main">

                                        <div className="priority-warning-icon">
                                            <AlertTriangle size={16} />
                                        </div>

                                        <div>

                                            <strong>
                                                {stock.stockName}
                                            </strong>

                                            <span>
                                                Available {stock.availableQuantity}
                                                {" · "}
                                                Reorder level {stock.reorderLevel}
                                            </span>

                                        </div>

                                    </div>


                                    <div className="shortage-badge">

                                        <TrendingDown size={14} />

                                        Short by {stock.shortage}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* ================================================= */}
            {/* TABLE CARD */}
            {/* ================================================= */}

            <div className="stock-summary-table-card">


                {/* TABLE HEADER */}

                <div className="table-section-heading">

                    <div>

                        <div className="table-heading-title">

                            <Package size={19} />

                            <h3>
                                Stock Inventory
                            </h3>

                        </div>

                        <p>
                            Detailed inventory position for each stock item.
                        </p>

                    </div>

                    <span className="table-record-count">

                        {filteredStockSummaries.length}
                        {" "}
                        {filteredStockSummaries.length === 1
                            ? "item"
                            : "items"}

                    </span>

                </div>


                {/* SEARCH */}

                <div className="table-toolbar stock-summary-toolbar">

                    <div className="search-box stock-summary-search">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search by ID, stock item or category..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />

                    </div>

                </div>


                {/* TABLE */}

                <div className="table-wrapper">

                    <table className="data-table stock-summary-data-table">

                        <thead>

                            <tr>

                                <th>
                                    Summary ID
                                </th>

                                <th>
                                    Stock Item
                                </th>

                                <th>
                                    Received
                                </th>

                                <th>
                                    Dispatched
                                </th>

                                <th>
                                    Available
                                </th>

                                <th>
                                    Reorder Level
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

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
                                                key={stock.id}
                                                className={
                                                    isLowStock
                                                        ? "low-stock-row"
                                                        : ""
                                                }
                                            >

                                                <td>

                                                    <span className="stock-summary-id-badge">
                                                        SS-{stock.id}
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="stock-item-cell">

                                                        <div className="stock-item-avatar">
                                                            <Package size={16} />
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {stock.stockName}
                                                            </strong>

                                                            <span>
                                                                Item #{stock.stockItemId}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span className="quantity-badge received-quantity">
                                                        <ArrowDownToLine size={13} />
                                                        {stock.totalReceived}
                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="quantity-badge dispatched-quantity">
                                                        <ArrowUpFromLine size={13} />
                                                        {stock.totalDispatched}
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            isLowStock
                                                                ? "available-quantity-badge low"
                                                                : "available-quantity-badge"
                                                        }
                                                    >
                                                        {stock.availableQuantity}
                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="reorder-level-badge">
                                                        {stock.reorderLevel}
                                                    </span>

                                                </td>


                                                <td>

                                                    {isLowStock ? (

                                                        <span className="stock-status-badge low">
                                                            <AlertTriangle size={13} />
                                                            Low Stock
                                                        </span>

                                                    ) : (

                                                        <span className="stock-status-badge healthy">
                                                            <ShieldCheck size={13} />
                                                            Healthy
                                                        </span>

                                                    )}

                                                </td>


                                                <td>

                                                    <div className="action-buttons">

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

                                                            <Eye size={15} />

                                                            View

                                                        </button>


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

                                                                    <Pencil size={15} />

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


                {/* PAGINATION */}

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
            {/* VIEW STOCK MODAL */}
            {/* ================================================= */}

            {selectedStock &&
                modalType === "view" && (

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

                            <div className="modal-header">

                                <div className="modal-title-with-icon">

                                    <div className="stock-modal-icon view-icon">
                                        <PackageCheck size={21} />
                                    </div>

                                    <div>

                                        <h2>
                                            Stock Details
                                        </h2>

                                        <p>
                                            Current inventory position
                                        </p>

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


                                {/* STOCK IDENTITY */}

                                <div className="stock-modal-identity">

                                    <div className="stock-modal-product-icon">
                                        <Package size={25} />
                                    </div>

                                    <div>

                                        <span>
                                            Stock Item
                                        </span>

                                        <strong>
                                            {selectedStock.stockName}
                                        </strong>

                                        <small>
                                            Item ID #{selectedStock.stockItemId}
                                        </small>

                                    </div>

                                </div>


                                {/* SUMMARY CARDS */}

                                <div className="stock-modal-summary-grid">

                                    <div className="stock-modal-summary-card blue">

                                        <span>
                                            Total Received
                                        </span>

                                        <strong>
                                            {selectedStock.totalReceived}
                                        </strong>

                                    </div>


                                    <div className="stock-modal-summary-card orange">

                                        <span>
                                            Total Dispatched
                                        </span>

                                        <strong>
                                            {selectedStock.totalDispatched}
                                        </strong>

                                    </div>


                                    <div
                                        className={
                                            selectedStock.availableQuantity <
                                                selectedStock.reorderLevel
                                                ? "stock-modal-summary-card warning"
                                                : "stock-modal-summary-card green"
                                        }
                                    >

                                        <span>
                                            Available
                                        </span>

                                        <strong>
                                            {selectedStock.availableQuantity}
                                        </strong>

                                    </div>


                                    <div className="stock-modal-summary-card purple">

                                        <span>
                                            Reorder Level
                                        </span>

                                        <strong>
                                            {selectedStock.reorderLevel}
                                        </strong>

                                    </div>

                                </div>


                                {/* DETAIL GRID */}

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


                                    <div className="modal-detail-item">

                                        <span>
                                            Category
                                        </span>

                                        <strong>
                                            {selectedStock.category || "—"}
                                        </strong>

                                    </div>


                                    <div className="modal-detail-item">

                                        <span>
                                            Unit
                                        </span>

                                        <strong>
                                            {selectedStock.unit || "—"}
                                        </strong>

                                    </div>

                                </div>


                                {/* STATUS */}

                                {selectedStock.availableQuantity <
                                    selectedStock.reorderLevel ? (

                                    <div className="stock-modal-warning">

                                        <div className="stock-modal-warning-icon">
                                            <AlertTriangle size={18} />
                                        </div>

                                        <div>

                                            <strong>
                                                Restocking Required
                                            </strong>

                                            <p>
                                                Available quantity is below
                                                the configured reorder level.
                                            </p>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="stock-modal-success">

                                        <ShieldCheck size={18} />

                                        <div>

                                            <strong>
                                                Stock Level Healthy
                                            </strong>

                                            <p>
                                                Available quantity is currently
                                                at or above the reorder level.
                                            </p>

                                        </div>

                                    </div>

                                )}

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


            {/* ================================================= */}
            {/* EDIT REORDER LEVEL MODAL */}
            {/* ================================================= */}

            {selectedStock &&
                modalType === "edit" && (

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

                            <div className="modal-header">

                                <div className="modal-title-with-icon">

                                    <div className="stock-modal-icon edit-icon">
                                        <Pencil size={20} />
                                    </div>

                                    <div>

                                        <h2>
                                            Edit Reorder Level
                                        </h2>

                                        <p>
                                            Update the minimum stock threshold
                                        </p>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={handleCloseModal}
                                    aria-label="Close"
                                    disabled={saving}
                                >
                                    <X size={20} />
                                </button>

                            </div>


                            <div className="modal-body">


                                <div className="reorder-stock-preview">

                                    <div className="reorder-preview-icon">
                                        <Package size={22} />
                                    </div>

                                    <div>

                                        <span>
                                            Stock Item
                                        </span>

                                        <strong>
                                            {selectedStock.stockName}
                                        </strong>

                                        <small>
                                            Item #{selectedStock.stockItemId}
                                        </small>

                                    </div>

                                </div>


                                <div className="reorder-current-level">

                                    <div>

                                        <span>
                                            Available Quantity
                                        </span>

                                        <strong>
                                            {selectedStock.availableQuantity}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Current Reorder Level
                                        </span>

                                        <strong>
                                            {selectedStock.reorderLevel}
                                        </strong>

                                    </div>

                                </div>


                                <div className="reorder-edit-section">

                                    <label
                                        htmlFor="reorderLevel"
                                        className="reorder-label"
                                    >
                                        New Reorder Level
                                    </label>

                                    <div className="reorder-input-wrapper">

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

                                        <span>
                                            {selectedStock.unit || "units"}
                                        </span>

                                    </div>

                                    <p className="reorder-help-text">
                                        When available stock falls below this
                                        quantity, the item will be flagged
                                        for restocking.
                                    </p>

                                </div>


                                <div className="reorder-threshold-preview">

                                    <div className="threshold-preview-icon">
                                        <AlertTriangle size={16} />
                                    </div>

                                    <div>

                                        <strong>
                                            Restocking threshold
                                        </strong>

                                        <span>
                                            Set a level that gives your team
                                            enough time to replenish this item.
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={handleCloseModal}
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