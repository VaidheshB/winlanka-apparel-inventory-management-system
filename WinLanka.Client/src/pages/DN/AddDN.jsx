import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AddDN() {
    const navigate = useNavigate();

    // Temporary stock item data.
    // This will come from the Stock Items API later.
    const stockItems = [
        { id: 101, name: "Basic T-Shirt", unit: "pcs" },
        { id: 102, name: "Formal Shirt", unit: "pcs" },
        { id: 103, name: "Ladies Blouse", unit: "pcs" },
        { id: 104, name: "Cotton Fabric", unit: "m" },
        { id: 105, name: "Denim Fabric", unit: "m" },
        { id: 106, name: "Polo Shirt", unit: "pcs" },
        { id: 107, name: "Women's Trousers", unit: "pcs" },
        { id: 108, name: "Women's Skirt", unit: "pcs" }
    ];

    const [formData, setFormData] = useState({
        customerName: "",
        date: "",
        items: []
    });

    const [errors, setErrors] = useState({});

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
    };

    const handleItemChange = (index, field, value) => {
        setFormData((previous) => {
            const updatedItems = [...previous.items];

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

    const handleRemoveItem = (index) => {
        setFormData((previous) => ({
            ...previous,
            items: previous.items.filter((_, itemIndex) => itemIndex !== index)
        }));
    };

    const getStockItem = (stockItemId) => {
        return stockItems.find(
            (item) => item.id === Number(stockItemId)
        );
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = "Customer name is required.";
        }

        if (!formData.date) {
            newErrors.date = "Date is required.";
        }

        if (formData.items.length === 0) {
            newErrors.items = "Add at least one stock item.";
        } else {
            const hasInvalidItem = formData.items.some(
                (item) =>
                    !item.stockItemId ||
                    !item.quantity ||
                    Number(item.quantity) <= 0
            );

            if (hasInvalidItem) {
                newErrors.items =
                    "Select a stock item and enter a valid quantity for every row.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submissionData = {
            customerName: formData.customerName,
            date: formData.date,
            items: formData.items.map((item) => ({
                stockItemId: Number(item.stockItemId),
                quantity: Number(item.quantity)
            }))
        };

        console.log("Dispatch Note data:", submissionData);

        // API integration will be added later.

        navigate("/dispatch-notes");
    };

    const handleCancel = () => {
        navigate("/dispatch-notes");
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
                        Back to DN Summary
                    </button>

                    <h1>Add Dispatch Note</h1>
                </div>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    {/* Dispatch Note Information */}
                    <div className="form-section">
                        <div className="form-section-header">
                            <h2>Dispatch Note Information</h2>
                            <p>
                                Enter the customer and date for this dispatch
                                note.
                            </p>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="customerName">
                                    Customer Name <span>*</span>
                                </label>

                                <input
                                    id="customerName"
                                    name="customerName"
                                    type="text"
                                    value={formData.customerName}
                                    onChange={handleHeaderChange}
                                    placeholder="Enter customer name"
                                    className={
                                        errors.customerName
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.customerName && (
                                    <small className="error-message">
                                        {errors.customerName}
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="date">
                                    Date <span>*</span>
                                </label>

                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleHeaderChange}
                                    className={
                                        errors.date ? "input-error" : ""
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
                                <h2>Stock Items Dispatched</h2>
                                <p>
                                    Add all stock items included in this
                                    dispatch note.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="secondary-add-button"
                                onClick={handleAddItem}
                            >
                                <Plus size={17} />
                                Add Stock Item
                            </button>
                        </div>

                        {formData.items.length === 0 ? (
                            <div className="empty-line-items">
                                <p>No stock items added yet.</p>

                                <button
                                    type="button"
                                    className="secondary-add-button"
                                    onClick={handleAddItem}
                                >
                                    <Plus size={17} />
                                    Add Stock Item
                                </button>
                            </div>
                        ) : (
                            <div className="line-items-container">
                                <div className="line-item-header-row">
                                    <span>Stock Item</span>
                                    <span>Stock Item ID</span>
                                    <span>Quantity</span>
                                    <span>Unit</span>
                                    <span>Action</span>
                                </div>

                                {formData.items.map((item, index) => {
                                    const selectedStockItem =
                                        getStockItem(item.stockItemId);

                                    return (
                                        <div
                                            className="line-item-row"
                                            key={index}
                                        >
                                            <div className="form-group">
                                                <select
                                                    value={item.stockItemId}
                                                    onChange={(event) =>
                                                        handleItemChange(
                                                            index,
                                                            "stockItemId",
                                                            event.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select stock item
                                                    </option>

                                                    {stockItems.map(
                                                        (stockItem) => (
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

                                            <div className="line-item-id">
                                                {selectedStockItem
                                                    ? selectedStockItem.id
                                                    : "—"}
                                            </div>

                                            <div className="form-group">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={item.quantity}
                                                    onChange={(event) =>
                                                        handleItemChange(
                                                            index,
                                                            "quantity",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="Quantity"
                                                />
                                            </div>

                                            <div className="line-item-unit">
                                                {selectedStockItem
                                                    ? selectedStockItem.unit
                                                    : "—"}
                                            </div>

                                            <button
                                                type="button"
                                                className="remove-item-button"
                                                onClick={() =>
                                                    handleRemoveItem(index)
                                                }
                                                title="Remove item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {errors.items && (
                            <small className="error-message">
                                {errors.items}
                            </small>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button form-submit-button"
                        >
                            <Save size={18} />
                            Add Dispatch Note
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddDN;