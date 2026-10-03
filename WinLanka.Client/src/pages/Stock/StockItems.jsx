import { useMemo, useState, useEffect } from "react";
import {
    Eye,
    PackagePlus,
    X,
    Package,
    Layers3,
    Ruler,
    BellRing,
    Boxes
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllStockItems } from "../../services/api";
import { getCurrentUser } from "../../services/auth";

function StockItems() {

    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    const isStorekeeper =
        currentUser?.roles?.includes("Storekeeper");

    const isStockManager =
        currentUser?.roles?.includes("Stock Manager");


    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedItem, setSelectedItem] = useState(null);

    const [stockItems, setStockItems] = useState([]);

    const [isLoadingStocks, setIsLoadingStocks] =
        useState(true);

    const [stocksError, setStocksError] =
        useState("");


    /*
    ============================================================
    LOAD STOCK ITEMS
    ============================================================
    */

    const loadStockItems = async () => {

        console.log(
            "🚀 STOCK ITEMS PAGE: loadStockItems() STARTED"
        );

        try {

            setIsLoadingStocks(true);
            setStocksError("");

            const data =
                await getAllStockItems();

            console.log(
                "✅ Stock API returned:",
                data
            );


            const formattedItems =
                data.map((item) => ({

                    id: item.StockItemId,

                    name:
                        item.StockName || "",

                    category:
                        item.Category || "",

                    unit:
                        item.Unit || "",

                    reorderLevel:
                        item.ReorderLevel ?? 0

                }));


            setStockItems(formattedItems);

        } catch (error) {

            console.error(
                "❌ STOCK ITEMS ERROR",
                error
            );

            setStocksError(
                error.message ||
                "Unable to load stock items."
            );

        } finally {

            setIsLoadingStocks(false);

            console.log(
                "🏁 STOCK ITEMS PAGE: loadStockItems() FINISHED"
            );
        }
    };


    useEffect(() => {
        loadStockItems();
    }, []);


    const itemsPerPage = 5;


    /*
    ============================================================
    DASHBOARD STATISTICS
    ============================================================
    */

    const dashboardStats = useMemo(() => {

        const totalItems =
            stockItems.length;


        const categories =
            [
                ...new Set(
                    stockItems
                        .map((item) =>
                            item.category.trim()
                        )
                        .filter(Boolean)
                )
            ];


        const units =
            [
                ...new Set(
                    stockItems
                        .map((item) =>
                            item.unit.trim()
                        )
                        .filter(Boolean)
                )
            ];


        const reorderConfigured =
            stockItems.filter(
                (item) =>
                    Number(item.reorderLevel) > 0
            ).length;


        return {

            totalItems,

            categoryCount:
                categories.length,

            unitCount:
                units.length,

            reorderConfigured

        };

    }, [stockItems]);


    /*
    ============================================================
    CATEGORY DISTRIBUTION
    ============================================================
    */

    const categoryData = useMemo(() => {

        const categoryMap = {};

        stockItems.forEach((item) => {

            const category =
                item.category.trim() ||
                "Uncategorized";

            categoryMap[category] =
                (categoryMap[category] || 0) + 1;

        });


        const sorted =
            Object.entries(categoryMap)
                .map(([name, count]) => ({
                    name,
                    count
                }))
                .sort(
                    (a, b) =>
                        b.count - a.count
                );


        const maximum =
            Math.max(
                ...sorted.map(
                    (item) => item.count
                ),
                1
            );


        return sorted.map((item) => ({

            ...item,

            percentage:
                (item.count / maximum) * 100

        }));

    }, [stockItems]);


    /*
    ============================================================
    CATEGORY DONUT
    ============================================================
    */

    const categoryDonut =
        useMemo(() => {

            if (
                stockItems.length === 0
            ) {
                return {
                    background:
                        "#e2e8f0"
                };
            }


            const categories = {};

            stockItems.forEach((item) => {

                const category =
                    item.category.trim() ||
                    "Uncategorized";

                categories[category] =
                    (categories[category] || 0) + 1;

            });


            const entries =
                Object.entries(categories)
                    .sort(
                        (a, b) =>
                            b[1] - a[1]
                    );


            const colors = [
                "#2563eb",
                "#f97316",
                "#7c3aed",
                "#16a34a",
                "#0891b2",
                "#db2777"
            ];


            let currentPercentage = 0;

            const segments =
                entries.map(
                    ([name, count], index) => {

                        const percentage =
                            (count /
                                stockItems.length) *
                            100;

                        const start =
                            currentPercentage;

                        const end =
                            currentPercentage +
                            percentage;

                        currentPercentage =
                            end;

                        return {
                            name,
                            count,
                            color:
                                colors[
                                    index %
                                    colors.length
                                ],
                            start,
                            end
                        };

                    }
                );


            const gradient =
                segments
                    .map(
                        (segment) =>
                            `${segment.color} ${segment.start}% ${segment.end}%`
                    )
                    .join(", ");


            return {
                background:
                    `conic-gradient(${gradient})`
            };

        }, [stockItems]);


    /*
    ============================================================
    SEARCH
    ============================================================
    */

    const filteredItems =
        useMemo(() => {

            const search =
                searchTerm
                    .toLowerCase()
                    .trim();


            if (!search) {
                return stockItems;
            }


            return stockItems.filter(
                (item) =>

                    item.id
                        .toString()
                        .includes(search) ||

                    item.name
                        .toLowerCase()
                        .includes(search) ||

                    item.category
                        .toLowerCase()
                        .includes(search) ||

                    item.unit
                        .toLowerCase()
                        .includes(search)
            );

        }, [
            searchTerm,
            stockItems
        ]);


    /*
    ============================================================
    PAGINATION
    ============================================================
    */

    const totalPages =
        Math.ceil(
            filteredItems.length /
            itemsPerPage
        );


    const paginatedItems =
        filteredItems.slice(
            (currentPage - 1) *
            itemsPerPage,

            currentPage *
            itemsPerPage
        );


    const handleSearch =
        (event) => {

            setSearchTerm(
                event.target.value
            );

            setCurrentPage(1);

        };


    const handleAddStock =
        () => {

            navigate("/stock/add");

        };


    /*
    ============================================================
    VIEW MODAL
    ============================================================
    */

    const handleViewStock =
        (item) => {

            setSelectedItem(item);

        };


    const handleCloseModal =
        () => {

            setSelectedItem(null);

        };


    return (

        <div className="page-container">


            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="page-header">

                <div className="page-header-content">

                    <div className="page-title-icon stock-page-icon">

                        <Package size={24} />

                    </div>


                    <div>

                        <h1>
                            Stock Items
                        </h1>

                        <p>
                            Manage the catalogue of stock items,
                            categories and units.
                        </p>

                    </div>

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


            {/* ==================================================
                STAT CARDS
            ================================================== */}

            <div className="user-stat-grid stock-stat-grid">


                {/* TOTAL ITEMS */}

                <div className="user-stat-card blue">

                    <div className="user-stat-top">

                        <div className="user-stat-icon">

                            <Package size={21} />

                        </div>

                        <span className="user-stat-label">
                            Total Stock Items
                        </span>

                    </div>


                    <div className="user-stat-value">

                        {dashboardStats.totalItems}

                    </div>


                    <div className="user-stat-footer">
                        Registered stock catalogue items
                    </div>

                </div>


                {/* CATEGORIES */}

                <div className="user-stat-card orange">

                    <div className="user-stat-top">

                        <div className="user-stat-icon">

                            <Layers3 size={21} />

                        </div>

                        <span className="user-stat-label">
                            Categories
                        </span>

                    </div>


                    <div className="user-stat-value">

                        {dashboardStats.categoryCount}

                    </div>


                    <div className="user-stat-footer">
                        Different stock categories
                    </div>

                </div>


                {/* UNITS */}

                <div className="user-stat-card purple">

                    <div className="user-stat-top">

                        <div className="user-stat-icon">

                            <Ruler size={21} />

                        </div>

                        <span className="user-stat-label">
                            Units
                        </span>

                    </div>


                    <div className="user-stat-value">

                        {dashboardStats.unitCount}

                    </div>


                    <div className="user-stat-footer">
                        Measurement units in catalogue
                    </div>

                </div>


                {/* REORDER */}

                <div className="user-stat-card green">

                    <div className="user-stat-top">

                        <div className="user-stat-icon">

                            <BellRing size={21} />

                        </div>

                        <span className="user-stat-label">
                            Reorder Levels
                        </span>

                    </div>


                    <div className="user-stat-value">

                        {dashboardStats.reorderConfigured}

                    </div>


                    <div className="user-stat-footer">
                        Items with reorder thresholds
                    </div>

                </div>

            </div>


            {/* ==================================================
                ANALYTICS
            ================================================== */}

            <div className="users-analytics-grid stock-analytics-grid">


                {/* ==================================================
                    ITEMS BY CATEGORY
                ================================================== */}

                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <h2>
                                Items by Category
                            </h2>

                            <p>
                                Number of stock items in each category
                            </p>

                        </div>


                        <div className="dashboard-panel-icon blue-panel">

                            <Boxes size={19} />

                        </div>

                    </div>


                    <div className="scope-chart">

                        {categoryData.length > 0 ? (

                            categoryData
                                .slice(0, 6)
                                .map(
                                    (item, index) => (

                                        <div
                                            className="scope-chart-row"
                                            key={item.name}
                                        >

                                            <div className="scope-chart-label">

                                                <span>
                                                    {item.name}
                                                </span>

                                                <strong>
                                                    {item.count}
                                                </strong>

                                            </div>


                                            <div className="scope-bar-track">

                                                <div
                                                    className={`scope-bar-fill stock-category-bar category-color-${index % 6}`}
                                                    style={{
                                                        width:
                                                            `${item.percentage}%`
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    )

                                )

                        ) : (

                            <div className="dashboard-empty-state">

                                No category information available.

                            </div>

                        )}

                    </div>


                    {categoryData.length > 6 && (

                        <div className="dashboard-panel-note">

                            <span className="note-dot" />

                            Showing the top 6 categories.

                        </div>

                    )}

                </div>


                {/* ==================================================
                    CATEGORY DONUT
                ================================================== */}

                <div className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <h2>
                                Inventory Structure
                            </h2>

                            <p>
                                Category distribution across stock items
                            </p>

                        </div>


                        <div className="dashboard-panel-icon orange-panel">

                            <Layers3 size={19} />

                        </div>

                    </div>


                    <div className="stock-donut-content">


                        <div
                            className="stock-category-donut"
                            style={categoryDonut}
                        >

                            <div className="stock-category-donut-inner">

                                <strong>
                                    {dashboardStats.totalItems}
                                </strong>

                                <span>
                                    Items
                                </span>

                            </div>

                        </div>


                        <div className="stock-category-legend">

                            {categoryData
                                .slice(0, 4)
                                .map(
                                    (item, index) => (

                                        <div
                                            className="stock-category-legend-item"
                                            key={item.name}
                                        >

                                            <span
                                                className={`category-legend-dot category-dot-${index % 6}`}
                                            />


                                            <div>

                                                <strong>
                                                    {item.count}
                                                </strong>

                                                <span>
                                                    {item.name}
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )}

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                STOCK ITEM CATALOGUE
            ================================================== */}

            <div className="table-card">

                <div className="table-toolbar">

                    <div>

                        <h2 className="table-section-title">
                            Stock Item Catalogue
                        </h2>

                        <p className="table-section-description">
                            View registered stock items and their
                            reorder configuration.
                        </p>

                    </div>


                    <div className="search-box">

                        <input
                            type="text"
                            placeholder="Search by ID, name, category or unit..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />

                    </div>

                </div>


                {/* ==================================================
                    TABLE
                ================================================== */}

                <div className="table-wrapper">

                    <table className="data-table">

                        <thead>

                            <tr>

                                <th>
                                    Stock Item ID
                                </th>

                                <th>
                                    Stock Item
                                </th>

                                <th>
                                    Category
                                </th>

                                <th>
                                    Unit
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

                                paginatedItems.map(
                                    (item) => (

                                        <tr
                                            key={item.id}
                                        >

                                            <td>

                                                <span className="user-id-badge">

                                                    #{item.id}

                                                </span>

                                            </td>


                                            <td className="stock-item-name">

                                                {item.name}

                                            </td>


                                            <td>

                                                <span className="category-table-badge">

                                                    {item.category}

                                                </span>

                                            </td>


                                            <td>

                                                <span className="unit-table-badge">

                                                    {item.unit}

                                                </span>

                                            </td>


                                            <td>

                                                <span className="reorder-level-badge">

                                                    {item.reorderLevel}

                                                </span>

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

                                    )
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="empty-table"
                                    >
                                        No stock items found.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>


                {/* ==================================================
                    PAGINATION
                ================================================== */}

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


            {/* ==================================================
                VIEW STOCK ITEM MODAL
            ================================================== */}

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


                        <div className="modal-header">

                            <div>

                                <h2>
                                    View Stock Item
                                </h2>

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


                        <div className="modal-body">

                            <div className="modal-detail-grid">


                                <div className="modal-detail-item">

                                    <span>
                                        Stock Item ID
                                    </span>

                                    <strong>
                                        {selectedItem.id}
                                    </strong>

                                </div>


                                <div className="modal-detail-item">

                                    <span>
                                        Stock Item
                                    </span>

                                    <strong>
                                        {selectedItem.name}
                                    </strong>

                                </div>


                                <div className="modal-detail-item">

                                    <span>
                                        Category
                                    </span>

                                    <strong>
                                        {selectedItem.category}
                                    </strong>

                                </div>


                                <div className="modal-detail-item">

                                    <span>
                                        Unit
                                    </span>

                                    <strong>
                                        {selectedItem.unit}
                                    </strong>

                                </div>


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