const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

const TOTAL_PRODUCTS = 100000;
const BATCH_SIZE = 10000;
const CONCURRENCY = 3;

const categories = [1, 2, 3, 4];

const adjectives = [
    "Smart",
    "Premium",
    "Wireless",
    "Portable",
    "Ultra",
    "Classic",
    "Advanced",
    "Compact",
    "Modern",
    "Elite"
];

const nouns = [
    "Phone",
    "Laptop",
    "Watch",
    "Book",
    "Shoes",
    "Bag",
    "Headphones",
    "Camera",
    "Ball",
    "Jacket"
];

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateProducts(count) {
    return Array.from({ length: count }, () => ({
        name: `${randomElement(adjectives)} ${randomElement(nouns)}`,
        price: Math.floor(Math.random() * 9000) + 1000,
        category: randomElement(categories)
    }));
}

async function seed() {
    try {
        await Product.deleteMany();

        let nextBatchStart = 0;

        async function worker(id) {
            while (true) {
                const start = nextBatchStart;

                if (start >= TOTAL_PRODUCTS) {
                    break;
                }

                nextBatchStart += BATCH_SIZE;

                const size = Math.min(BATCH_SIZE, TOTAL_PRODUCTS - start);

                const batch = generateProducts(size);

                await Product.collection.insertMany(batch, {
                    ordered: false
                });

                console.log(`Worker ${id}: Inserted ${start + size}/${TOTAL_PRODUCTS}`);
            }
        }

        const workers = [];

        for (let i = 1; i <= CONCURRENCY; i++) {
            workers.push(worker(i));
        }

        await Promise.all(workers);

        console.log("Done");

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);

        await mongoose.connection.close();
    }
}

seed();