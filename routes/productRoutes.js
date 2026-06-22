const router = require('express').Router();
const {getProducts} = require('../controllers/productController');
const validateProducts = require('../middlware/productValidation');

router.get('/',validateProducts,getProducts);

module.exports = router;