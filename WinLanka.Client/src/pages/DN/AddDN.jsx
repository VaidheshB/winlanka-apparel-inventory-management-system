import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    getAllStockItems,
    addDispatchNote
} from "../../services/api";

function AddDN() {
    const navigate = useNavigate();

    const [stockItems, setStockItems] = useState([]);
    const [isLoadingStockItems, setIsLoadingStockItems] =
        useState(true);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [formData, setFormData] = useState({
        customerName: "",
        date: "",
        items: []
    });

    const [errors, setErrors] = useState({});


    // ============================================================
    // LOAD STOCK ITEMS
    // ============================================================

    useEffect(() => {
        const loadStockItems = async () => {
            try {
                setIsLoadingStockItems(true);

                const data =
                    await getAllStockItems();

                const formattedStockItems =
                    data.map((item) => ({
                        id: item.StockItemId,
                        name: item.StockName || "",
                        unit: item.Unit || ""
                    }));

                setStockItems(
                    formattedStockItems
                );
            } catch (error) {
                console.error(
                    "Failed to load stock items:",
                    error
                );

                setErrors((previous) => ({
                    ...previous,
                    stockItems:
                        error.message ||
                        "Unable to load stock items."
                }));
            } finally {
                setIsLoadingStockItems(false);
            }
        };

        loadStockItems();
    }, []);


    // ============================================================
    // HEADER INPUT CHANGE
    // ============================================================

    const handleHeaderChange = (event) => {
        const { name, value } =
            event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
            submit: ""
        }));
    };


    // ============================================================
    // ADD STOCK ITEM ROW
    // ============================================================

    const handleAddItem = () => {
        setFormData((previous) => ({
            ...previous,
            items: [
                ...previous.items,
                {
                    stockItemId: "",
                    quantity: ""
                }
            ]
        }));

        setErrors((previous) => ({
            ...previous,
            items: ""
        }));
    };


    // ============================================================
    // STOCK ITEM CHANGE
    // ============================================================

    const handleItemChange = (
        index,
        field,
        value
    ) => {
        setFormData((previous) => {
            const updatedItems = [
                ...previous.items
            ];

            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value
            };

            return {
                ...previous,
                items: updatedItems
            };
        });

        setErrors((previous) => ({
            ...previous,
            items: "",
            submit: ""
        }));
    };


    // ============================================================
    // REMOVE STOCK ITEM ROW
    // ============================================================

    const handleRemoveItem = (index) => {
        setFormData((previous) => ({
            ...previous,
            items: previous.items.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        }));

        setErrors((previous) => ({
            ...previous,
            items: ""
        }));
    };


    // ============================================================
    // GET STOCK ITEM
    // ============================================================

    const getStockItem = (stockItemId) => {
        return stockItems.find(
            (item) =>
                item.id === Number(stockItemId)
        );
    };


    // ============================================================
    // FORM VALIDATION
    // ============================================================

    const validateForm = () => {
        const newErrors = {};

        // Customer validation
        if (!formData.customerName.trim()) {
            newErrors.customerName =
                "Customer name is required.";
        }

        // Date validation
        if (!formData.date) {
            newErrors.date =
                "Date is required.";
        }

        // Item validation
        if (formData.items.length === 0) {
            newErrors.items =
                "Add at least one stock item.";
        } else {
            const hasInvalidItem =
                formData.items.some(
                    (item) =>
                        !item.stockItemId ||
                        Number(item.stockItemId) <= 0 ||
                        !item.quantity ||
                        Number(item.quantity) <= 0
                );

            if (hasInvalidItem) {
                newErrors.items =
                    "Select a stock item and enter a valid quantity for every row.";
            }

            // Check duplicate stock items
            const stockItemIds =
                formData.items.map(
                    (item) =>
                        Number(item.stockItemId)
                );

            const hasDuplicates =
                new Set(stockItemIds).size !==
                stockItemIds.length;

            if (hasDuplicates) {
                newErrors.items =
                    "The same stock item cannot be added more than once.";
            }
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };


    // ============================================================
    // SUBMIT
    // ============================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            setErrors((previous) => ({
                ...previous,
                submit: ""
            }));

            const submissionData = {
                customer:
                    formData.customerName.trim(),

                date:
                    formData.date,

                items:
                    formData.items.map(
                        (item) => ({
                            stockItemId:
                                Number(
                                    item.stockItemId
                                ),

                            quantity:
                                Number(
                                    item.quantity
                                )
                        })
                    )
            };

            console.log(
                "Dispatch Note payload:",
                JSON.stringify(
                    submissionData,
                    null,
                    2
                )
            );

            const result =
                await addDispatchNote(
                    submissionData
                );

            console.log(
                "Dispatch Note orchestration started:",
                result
            );

            navigate(
                "/dispatch-notes"
            );
        } catch (error) {
            console.error(
                "Failed to add Dispatch Note:",
                error
            );

            setErrors((previous) => ({
                ...previous,
                submit:
                    error.message ||
                    "Unable to add Dispatch Note."
            }));
        } finally {
            setIsSubmitting(false);
        }
    };


    // ============================================================
    // CANCEL
    // ============================================================

    const handleCancel = () => {
        navigate(
            "/dispatch-notes"
        );
    };


    return (
        <div className="page-container">

            {/* ================================================== */}
            {/* PAGE HEADER */}
            {/* ================================================== */}

            <div className="form-page-header">
                <div>
                    <button
                        type="button"
                        className="back-button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        <ArrowLeft size={18} />
                        Back to DN Summary
                    </button>

                    <h1>
                        Add Dispatch Note
                    </h1>
                </div>
            </div>


            {/* ================================================== */}
            {/* FORM CARD */}
            {/* ================================================== */}

            <div className="form-card">
                <form onSubmit={handleSubmit}>

                    {/* ========================================== */}
                    {/* DISPATCH NOTE INFORMATION */}
                    {/* ========================================== */}

                    <div className="form-section">

                        <div className="form-section-header">
                            <h2>
                                Dispatch Note Information
                            </h2>

                            <p>
                                Enter the customer and date
                                for this dispatch note.
                            </p>
                        </div>

                        <div className="form-grid">

                            {/* Customer */}

                            <div className="form-group">
                                <label htmlFor="customerName">
                                    Customer Name{" "}
                                    <span>*</span>
                                </label>

                                <input
                                    id="customerName"
                                    name="customerName"
                                    type="text"
                                    value={
                                        formData.customerName
                                    }
                                    onChange={
                                        handleHeaderChange
                                    }
                                    placeholder="Enter customer name"
                                    className={
                                        errors.customerName
                                            ? "input-error"
                                            : ""
                                    }
                                    disabled={
                                        isSubmitting
                                    }
                                />

                                {errors.customerName && (
                                    <small className="error-message">
                                        {
                                            errors.customerName
                                        }
                                    </small>
                                )}
                            </div>


                            {/* Date */}

                            <div className="form-group">
                                <label htmlFor="date">
                                    Date{" "}
                                    <span>*</span>
                                </label>

                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={
                                        formData.date
                                    }
                                    onChange={
                                        handleHeaderChange
                                    }
                                    className={
                                        errors.date
                                            ? "input-error"
                                            : ""
                                    }
                                    disabled={
                                        isSubmitting
                                    }
                                />

                                {errors.date && (
                                    <small className="error-message">
                                        {errors.date}
                                    </small>
                                )}
                            </div>

                        </div>
                    </div>


                    <div className="form-divider" />


                    {/* ================================================== */}
                    {/* STOCK ITEMS */}
                    {/* ================================================== */}

                    <div className="form-section">

                        <div className="line-items-header">

                            <div className="form-section-header">
                                <h2>
                                    Stock Items Dispatched
                                </h2>

                                <p>
                                    Add all stock items
                                    included in this
                                    dispatch note.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="secondary-add-button"
                                onClick={
                                    handleAddItem
                                }
                                disabled={
                                    isLoadingStockItems ||
                                    isSubmitting
                                }
                            >
                                <Plus size={17} />
                                Add Stock Item
                            </button>

                        </div>


                        {/* Stock item loading error */}

                        {errors.stockItems && (
                            <small className="error-message">
                                {errors.stockItems}
                            </small>
                        )}


                        {/* Loading */}

                        {isLoadingStockItems ? (
                            <div className="empty-line-items">
                                <p>
                                    Loading stock items...
                                </p>
                            </div>
                        ) : formData.items.length === 0 ? (

                            /* Empty state */

                            <div className="empty-line-items">

                                <p>
                                    No stock items added yet.
                                </p>

                                <button
                                    type="button"
                                    className="secondary-add-button"
                                    onClick={
                                        handleAddItem
                                    }
                                >
                                    <Plus size={17} />
                                    Add Stock Item
                                </button>

                            </div>

                        ) : (

                            /* Items */

                            <div className="line-items-container">

                                <div className="line-item-header-row">
                                    <span>
                                        Stock Item
                                    </span>

                                    <span>
                                        Stock Item ID
                                    </span>

                                    <span>
                                        Quantity
                                    </span>

                                    <span>
                                        Unit
                                    </span>

                                    <span>
                                        Action
                                    </span>
                                </div>


                                {formData.items.map(
                                    (item, index) => {

                                        const selectedStockItem =
                                            getStockItem(
                                                item.stockItemId
                                            );

                                        return (
                                            <div
                                                className="line-item-row"
                                                key={index}
                                            >

                                                {/* Stock Item */}

                                                <div className="form-group">
                                                    <select
                                                        value={
                                                            item.stockItemId
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleItemChange(
                                                                index,
                                                                "stockItemId",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            isSubmitting
                                                        }
                                                    >
                                                        <option value="">
                                                            Select stock item
                                                        </option>

                                                        {stockItems.map(
                                                            (
                                                                stockItem
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        stockItem.id
                                                                    }
                                                                    value={
                                                                        stockItem.id
                                                                    }
                                                                >
                                                                    {
                                                                        stockItem.name
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>


                                                {/* Stock Item ID */}

                                                <div className="line-item-id">
                                                    {selectedStockItem
                                                        ? selectedStockItem.id
                                                        : "—"}
                                                </div>


                                                {/* Quantity */}

                                                <div className="form-group">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={
                                                            item.quantity
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleItemChange(
                                                                index,
                                                                "quantity",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder="Quantity"
                                                        disabled={
                                                            isSubmitting
                                                        }
                                                    />
                                                </div>


                                                {/* Unit */}

                                                <div className="line-item-unit">
                                                    {selectedStockItem
                                                        ? selectedStockItem.unit
                                                        : "—"}
                                                </div>


                                                {/* Remove */}

                                                <button
                                                    type="button"
                                                    className="remove-item-button"
                                                    onClick={() =>
                                                        handleRemoveItem(
                                                            index
                                                        )
                                                    }
                                                    title="Remove item"
                                                    disabled={
                                                        isSubmitting
                                                    }
                                                >
                                                    <Trash2
                                                        size={18}
                                                    />
                                                </button>

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        )}


                        {/* Item error */}

                        {errors.items && (
                            <small className="error-message">
                                {errors.items}
                            </small>
                        )}

                    </div>


                    {/* ================================================== */}
                    {/* SUBMIT ERROR */}
                    {/* ================================================== */}

                    {errors.submit && (
                        <div className="error-message">
                            {errors.submit}
                        </div>
                    )}


                    {/* ================================================== */}
                    {/* ACTIONS */}
                    {/* ================================================== */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                handleCancel
                            }
                            disabled={
                                isSubmitting
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button form-submit-button"
                            disabled={
                                isSubmitting ||
                                isLoadingStockItems
                            }
                        >
                            <Save size={18} />

                            {isSubmitting
                                ? "Adding Dispatch Note..."
                                : "Add Dispatch Note"}
                        </button>

                    </div>

                </form>
            </div>

        </div>
    );
}

export default AddDN;