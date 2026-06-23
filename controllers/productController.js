const Product = require("../models/Product");

const encodeCursor = (product) =>
    Buffer.from(
        JSON.stringify({
            createdAt: product.createdAt,
            id: product._id
        })
    ).toString("base64");

const getProducts = async (req, res) => {
    try {
        const category = Number(req.query.category);
        const limit = Math.min(Number(req.query.limit) || 10, 100);
        const direction = req.query.direction || "next";
        const cursorData = req.cursorData;

        const query = { category };

        if (cursorData) {
            const cursorDate = new Date(cursorData.createdAt);

            if (direction === "next") {
                query.$or = [
                    {
                        createdAt: {
                            $lt: cursorDate
                        }
                    },
                    {
                        createdAt: cursorDate,
                        _id: {
                            $lt: cursorData.id
                        }
                    }
                ];
            } else {
                query.$or = [
                    {
                        createdAt: {
                            $gt: cursorDate
                        }
                    },
                    {
                        createdAt: cursorDate,
                        _id: {
                            $gt: cursorData.id
                        }
                    }
                ];
            }
        }

        let products = await Product.find(query)
            .sort(
                direction === "next"
                    ? { createdAt: -1, _id: -1 }
                    : { createdAt: 1, _id: 1 }
            ).limit(limit + 1);

        const hasExtra = products.length > limit;

        if (hasExtra) {
            products.pop();
        }

        if (direction === "prev") {
            products.reverse();
        }

        let hasNext = false;
        let hasPrev = false;

        if (!cursorData) {
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
            nextCursor: hasNext && products.length ? encodeCursor(products[products.length - 1]) : null,
            prevCursor: hasPrev && products.length ? encodeCursor(products[0]) : null,
            hasNext,
            hasPrev
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Server error"});
    }
};

module.exports = {
    getProducts
};