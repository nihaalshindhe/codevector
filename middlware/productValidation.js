const { query, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const validateProducts = [
    query("category")
        .exists()
        .withMessage("Category is required")
        .isInt({ min: 1, max: 4 })
        .withMessage("Invalid category"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("direction")
        .optional()
        .isIn(["next", "prev"])
        .withMessage("Direction must be next or prev"),

    query("cursor")
        .optional()
        .custom((value, { req }) => {
            try {
                const cursorData = JSON.parse(
                    Buffer.from(value, "base64").toString()
                );

                if (
                    isNaN(new Date(cursorData.createdAt)) ||
                    !mongoose.Types.ObjectId.isValid(cursorData.id)
                ) {
                    return false;
                }

                req.cursorData = cursorData;

                return true;
            } catch {
                return false;
            }
        })
        .withMessage("Invalid cursor"),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        next();
    }
];

module.exports = validateProducts;