import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Eye, X } from "lucide-react";
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

    const itemsPerPage = 10;

    // Selected DN for View modal
    const [selectedDN, setSelectedDN] =
        useState(null);

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

                /*
                 * The API response is expected to be:
                 *
                 * [
                 *   {
                 *     dispatchNoteId,
                 *     customer,
                 *     date,
                 *     dispatchItems: [...]
                 *   }
                 * ]
                 */

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
    // SEARCH
    // =========================================

    const filteredDispatchNotes = useMemo(() => {
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

    const totalPages = Math.ceil(
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

    // Open View modal
    const handleViewDispatchNote = (dn) => {
        setSelectedDN(dn);
    };

    // Close View modal
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

            {/* ================================= */}
            {/* PAGE HEADER */}
            {/* ================================= */}

            <div className="page-header">

                <div>
                    <h1>
                        Dispatch Note Summary
                    </h1>
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


            {/* ================================= */}
            {/* TABLE CARD */}
            {/* ================================= */}

            <div className="table-card">

                {/* ================================= */}
                {/* TOOLBAR */}
                {/* ================================= */}

                <div className="table-toolbar">

                    <div className="search-box">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search by DN ID, customer, date or stock item..."
                            value={searchTerm}
                            onChange={
                                handleSearch
                            }
                        />

                    </div>

                </div>


                {/* ================================= */}
                {/* ERROR */}
                {/* ================================= */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                {/* ================================= */}
                {/* TABLE */}
                {/* ================================= */}

                <div className="table-wrapper">

                    <table className="data-table">

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
                                                {dn.id}
                                            </td>


                                            {/* Customer */}
                                            <td className="stock-item-name">
                                                {dn.customer}
                                            </td>


                                            {/* Date */}
                                            <td>
                                                {formatDate(
                                                    dn.date
                                                )}
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
                                                                className="grn-item"
                                                            >

                                                                <span className="grn-item-name">
                                                                    {
                                                                        item.name
                                                                    }
                                                                </span>

                                                                <span className="grn-item-quantity">
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


                {/* ================================= */}
                {/* PAGINATION */}
                {/* ================================= */}

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


            {/* ================================= */}
            {/* VIEW DN MODAL */}
            {/* ================================= */}

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

                        {/* ================================= */}
                        {/* MODAL HEADER */}
                        {/* ================================= */}

                        <div className="modal-header">

                            <div>

                                <h2>
                                    View Dispatched Note
                                </h2>

                                <p>
                                    View the complete DN
                                    information and
                                    dispatched items.
                                </p>

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


                        {/* ================================= */}
                        {/* MODAL BODY */}
                        {/* ================================= */}

                        <div className="modal-body">

                            {/* DN INFORMATION */}

                            <div className="modal-detail-grid">

                                {/* DN ID */}

                                <div className="modal-detail-item">

                                    <span>
                                        DN ID
                                    </span>

                                    <strong>
                                        {
                                            selectedDN.id
                                        }
                                    </strong>

                                </div>


                                {/* Date */}

                                <div className="modal-detail-item">

                                    <span>
                                        Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedDN.date
                                        )}
                                    </strong>

                                </div>


                                {/* Customer */}

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


                            {/* ================================= */}
                            {/* DISPATCHED ITEMS */}
                            {/* ================================= */}

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

                                            {selectedDN.items.map(
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
                                                            {index + 1}
                                                        </td>


                                                        <td className="modal-table-item-name">
                                                            {
                                                                item.name
                                                            }
                                                        </td>


                                                        <td>
                                                            {
                                                                item.quantity
                                                            }
                                                        </td>


                                                        <td>
                                                            {
                                                                item.unit
                                                            }
                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>


                        {/* ================================= */}
                        {/* MODAL FOOTER */}
                        {/* ================================= */}

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

