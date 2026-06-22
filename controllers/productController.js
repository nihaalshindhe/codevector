const Product = require("../models/Product");

const getProducts = async (req, res) => {
    try {
        const category = Number(req.query.category);
        const limit = Math.min(Number(req.query.limit) || 10, 100);
        const cursor = req.query.cursor;
        const direction = req.query.direction || "next";

        const query = { category };

        if (cursor) {
            const cursorDoc = await Product.findById(cursor).select("createdAt _id");

            if (!cursorDoc) {
                return res.status(400).json({error: "Invalid cursor"});
            }

            if (direction === "next") {
                query.$or = [
                    {
                        createdAt: {
                            $lt: cursorDoc.createdAt
                        }
                    },
                    {
                        createdAt: cursorDoc.createdAt,
                        _id: {
                            $lt: cursorDoc._id
                        }
                    }
                ];
            } else {
                query.$or = [
                    {
                        createdAt: {
                            $gt: cursorDoc.createdAt
                        }
                    },
                    {
                        createdAt: cursorDoc.createdAt,
                        _id: {
                            $gt: cursorDoc._id
                        }
                    }
                ];
            }
        }

        let products = await Product.find(query).sort(
            direction === "next"
                ? { createdAt: -1, _id: -1 }
                : { createdAt: 1, _id: 1 }
            ).limit(limit + 1);
        let hasExtra = products.length > limit;

        if (hasExtra) {
            products.pop();
        }

        if (direction === "prev") {
            products.reverse();
        }

        let hasNext = false;
        let hasPrev = false;

        if (!cursor) {
            hasPrev = false;
            hasNext = hasExtra;
        } else if (direction === "next") {
            hasPrev = true;
            hasNext = hasExtra;
        } else {
            hasNext = true;
            hasPrev = hasExtra;
        }


        res.status(200).json({
            products,
            nextCursor: hasNext && products.length ? products[products.length - 1]._id : null,
            prevCursor: hasPrev && products.length ? products[0]._id : null,
            hasNext,
            hasPrev
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Server error"
        });
    }
};

module.exports = {
    getProducts
};