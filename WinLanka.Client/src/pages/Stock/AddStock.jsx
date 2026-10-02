import { useState } from "react";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addStockItem } from "../../services/api";

function AddStock() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        stockItemName: "",
        category: "",
        unit: "",
        reorderLevel: ""
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        "Men",
        "Women",
        "Casual"
    ];

    const units = [
        "pcs",
        "nos",
        "cm",
        "m"
    ];

    const handleChange = (event) => {
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

    const validateForm = () => {
        const newErrors = {};

        if (!formData.stockItemName.trim()) {
            newErrors.stockItemName =
                "Stock item name is required.";
        }

        if (!formData.category) {
            newErrors.category =
                "Please select a category.";
        }

        if (!formData.unit) {
            newErrors.unit =
                "Please select a unit.";
        }

        if (
            formData.reorderLevel === "" ||
            Number(formData.reorderLevel) < 0
        ) {
            newErrors.reorderLevel =
                "Please enter a valid reorder level.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            setErrors({});

            const stockItem = {
                stockName:
                    formData.stockItemName.trim(),

                category:
                    formData.category,

                unit:
                    formData.unit,

                reorderLevel:
                    Number(formData.reorderLevel)
            };

            console.log(
                "========== ADD STOCK =========="
            );

            console.log(
                "Sending stock item:",
                stockItem
            );

            const response =
                await addStockItem(stockItem);

            console.log(
                "Stock item added successfully:",
                response
            );

            console.log(
                "==============================="
            );

            navigate("/stock");

        } catch (error) {

            console.error(
                "========== ADD STOCK ERROR =========="
            );

            console.error("Error:", error);
            console.error(
                "Message:",
                error.message
            );

            console.error(
                "======================================"
            );

            setErrors({
                submit:
                    error.message ||
                    "Unable to add stock item."
            });

        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate("/stock");
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
                        Back to Stock Items
                    </button>

                    <h1>Add Stock Item</h1>
                </div>
            </div>

            <div className="form-card">

                <form onSubmit={handleSubmit}>

                    <div className="form-section">

                        <div className="form-section-header">
                            <h2>
                                Stock Item Information
                            </h2>

                            <p>
                                Enter the details of the new stock item.
                            </p>
                        </div>

                        <div className="form-grid">

                            {/* Stock Item Name */}
                            <div className="form-group">

                                <label htmlFor="stockItemName">
                                    Stock Item Name{" "}
                                    <span>*</span>
                                </label>

                                <input
                                    id="stockItemName"
                                    name="stockItemName"
                                    type="text"
                                    value={
                                        formData.stockItemName
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter stock item name"
                                    className={
                                        errors.stockItemName
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.stockItemName && (
                                    <small className="error-message">
                                        {
                                            errors.stockItemName
                                        }
                                    </small>
                                )}

                            </div>

                            {/* Category */}
                            <div className="form-group">

                                <label htmlFor="category">
                                    Category{" "}
                                    <span>*</span>
                                </label>

                                <select
                                    id="category"
                                    name="category"
                                    value={
                                        formData.category
                                    }
                                    onChange={handleChange}
                                    className={
                                        errors.category
                                            ? "input-error"
                                            : ""
                                    }
                                >
                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map(
                                        (category) => (
                                            <option
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </option>
                                        )
                                    )}
                                </select>

                                {errors.category && (
                                    <small className="error-message">
                                        {
                                            errors.category
                                        }
                                    </small>
                                )}

                            </div>

                            {/* Unit */}
                            <div className="form-group">

                                <label htmlFor="unit">
                                    Unit <span>*</span>
                                </label>

                                <select
                                    id="unit"
                                    name="unit"
                                    value={
                                        formData.unit
                                    }
                                    onChange={handleChange}
                                    className={
                                        errors.unit
                                            ? "input-error"
                                            : ""
                                    }
                                >
                                    <option value="">
                                        Select unit
                                    </option>

                                    {units.map(
                                        (unit) => (
                                            <option
                                                key={unit}
                                                value={unit}
                                            >
                                                {unit}
                                            </option>
                                        )
                                    )}
                                </select>

                                {errors.unit && (
                                    <small className="error-message">
                                        {errors.unit}
                                    </small>
                                )}

                            </div>

                            {/* Reorder Level */}
                            <div className="form-group">

                                <label htmlFor="reorderLevel">
                                    Reorder Level{" "}
                                    <span>*</span>
                                </label>

                                <input
                                    id="reorderLevel"
                                    name="reorderLevel"
                                    type="number"
                                    min="0"
                                    value={
                                        formData.reorderLevel
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter reorder level"
                                    className={
                                        errors.reorderLevel
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.reorderLevel && (
                                    <small className="error-message">
                                        {
                                            errors.reorderLevel
                                        }
                                    </small>
                                )}

                            </div>

                        </div>

                        {/* API Error */}
                        {errors.submit && (
                            <div className="error-message">
                                {errors.submit}
                            </div>
                        )}

                    </div>

                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button form-submit-button"
                            disabled={isSubmitting}
                        >
                            <PackagePlus size={18} />

                            {isSubmitting
                                ? "Adding..."
                                : "Done"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddStock;