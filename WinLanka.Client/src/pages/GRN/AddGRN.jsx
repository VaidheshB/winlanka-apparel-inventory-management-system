import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    getAllStockItems,
    addGoodReceivedNote
} from "../../services/api";

function AddGRN() {
    const navigate = useNavigate();

    const [stockItems, setStockItems] = useState([]);
    const [isLoadingStockItems, setIsLoadingStockItems] =
        useState(true);
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [formData, setFormData] = useState({
        supplierName: "",
        date: "",
        items: [
            {
            stockItemId: "",
            quantity: ""
        }
        ]
    });

    const [errors, setErrors] = useState({});

    // -----------------------------------------
    // Load Stock Items
    // -----------------------------------------

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

                setStockItems(formattedStockItems);

            } catch (error) {
                console.error(
                    "Failed to load stock items:",
                    error
                );

                setErrors({
                    stockItems:
                        error.message ||
                        "Unable to load stock items."
                });

            } finally {
                setIsLoadingStockItems(false);
            }
        };

        loadStockItems();
    }, []);

    // -----------------------------------------
    // Header Change
    // -----------------------------------------

    const handleHeaderChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: ""
        }));
    };

    // -----------------------------------------
    // Add Item Row
    // -----------------------------------------

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

    // -----------------------------------------
    // Item Change
    // -----------------------------------------

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
            items: ""
        }));
    };

    // -----------------------------------------
    // Remove Item
    // -----------------------------------------

    const handleRemoveItem = (index) => {
        setFormData((previous) => ({
            ...previous,
            items: previous.items.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        }));
    };

    // -----------------------------------------
    // Get Selected Stock Item
    // -----------------------------------------

    const getStockItem = (stockItemId) => {
        return stockItems.find(
            (item) =>
                item.id === Number(stockItemId)
        );
    };

    // -----------------------------------------
    // Validate Form
    // -----------------------------------------

    const validateForm = () => {
        const newErrors = {};

        if (!formData.supplierName.trim()) {
            newErrors.supplierName =
                "Supplier name is required.";
        }

        if (!formData.date) {
            newErrors.date =
                "Date is required.";
        }

        if (formData.items.length === 0) {
            newErrors.items =
                "Add at least one stock item.";
        } else {
            const hasInvalidItem =
                formData.items.some(
                    (item) =>
                        !item.stockItemId ||
                        !item.quantity ||
                        Number(item.quantity) <= 0
                );

            if (hasInvalidItem) {
                newErrors.items =
                    "Select a stock item and enter a valid quantity for every row.";
            }

            // Prevent duplicate stock items
            const stockItemIds =
                formData.items
                    .filter(
                        (item) =>
                            item.stockItemId
                    )
                    .map(
                        (item) =>
                            Number(
                                item.stockItemId
                            )
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

    // -----------------------------------------
    // Submit
    // -----------------------------------------

   const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    try {
        setIsSubmitting(true);

        const submissionData = {
            supplier: formData.supplierName.trim(),
            date: formData.date,
            items: formData.items.map((item) => ({
                stockItemId: Number(item.stockItemId),
                quantity: Number(item.quantity)
            }))
        };

        console.log(
            "GRN payload:",
            JSON.stringify(submissionData, null, 2)
        );

        await addGoodReceivedNote(submissionData);

        navigate("/grn");
    } catch (error) {
        console.error(
            "Failed to add GRN:",
            error
        );

        setErrors((previous) => ({
            ...previous,
            submit:
                error.message ||
                "Unable to add Good Received Note."
        }));
    } finally {
        setIsSubmitting(false);
    }
};

    // -----------------------------------------
    // Cancel
    // -----------------------------------------

    const handleCancel = () => {
        navigate("/grn");
    };

    return (
        <div className="page-container">
            <div className="form-page-header">
                <div>
                    <button
                        type="button"
                        className="back-button"
                        onClick={handleCancel}
                    >
                        <ArrowLeft size={18} />
                        Back to GRN Summary
                    </button>

                    <h1>
                        Add Good Received Note
                    </h1>
                </div>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>

                    {/* GRN Information */}

                    <div className="form-section">
                        <div className="form-section-header">
                            <h2>
                                GRN Information
                            </h2>

                            <p>
                                Enter the supplier and
                                date for this goods
                                received note.
                            </p>
                        </div>

                        <div className="form-grid">

                            {/* Supplier */}

                            <div className="form-group">
                                <label htmlFor="supplierName">
                                    Supplier Name{" "}
                                    <span>*</span>
                                </label>

                                <input
                                    id="supplierName"
                                    name="supplierName"
                                    type="text"
                                    value={
                                        formData.supplierName
                                    }
                                    onChange={
                                        handleHeaderChange
                                    }
                                    placeholder="Enter supplier name"
                                    className={
                                        errors.supplierName
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.supplierName && (
                                    <small className="error-message">
                                        {
                                            errors.supplierName
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

                    {/* Stock Items */}

                    <div className="form-section">

                        <div className="line-items-header">

                            <div className="form-section-header">
                                <h2>
                                    Stock Items Received
                                </h2>

                                <p>
                                    Add all stock items
                                    included in this GRN.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="secondary-add-button"
                                onClick={
                                    handleAddItem
                                }
                                disabled={
                                    isLoadingStockItems
                                }
                            >
                                <Plus size={17} />
                                Add Stock Item
                            </button>
                        </div>

                        {/* Loading */}

                        {isLoadingStockItems ? (
                            <div className="empty-line-items">
                                <p>
                                    Loading stock items...
                                </p>
                            </div>
                        ) : errors.stockItems ? (
                            <div className="empty-line-items">
                                <p className="error-message">
                                    {
                                        errors.stockItems
                                    }
                                </p>
                            </div>
                        ) : formData.items.length ===
                          0 ? (

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
                                    (
                                        item,
                                        index
                                    ) => {

                                        const selectedStockItem =
                                            getStockItem(
                                                item.stockItemId
                                            );

                                        return (
                                            <div
                                                className="line-item-row"
                                                key={index}
                                            >

                                                {/* Stock Item Dropdown */}

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

                        {errors.items && (
                            <small className="error-message">
                                {errors.items}
                            </small>
                        )}
                    </div>

                    {/* Submit Error */}

                    {errors.submit && (
                        <small className="error-message">
                            {errors.submit}
                        </small>
                    )}

                    {/* Actions */}

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
                                ? "Adding..."
                                : "Add GRN"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default AddGRN;