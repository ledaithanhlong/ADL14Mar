var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventories');

// GET all inventories (populate product)
router.get('/', async function (req, res) {
    try {
        let data = await inventoryModel.find().populate({
            path: 'product',
            select: 'title price slug category'
        });
        res.send(data);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET inventory by ID (populate product)
router.get('/:id', async function (req, res) {
    try {
        let result = await inventoryModel.findById(req.params.id).populate({
            path: 'product',
            select: 'title price slug category'
        });
        if (!result) {
            return res.status(404).send({ message: 'Inventory not found' });
        }
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST add_stock - tăng stock theo quantity
router.post('/add_stock', async function (req, res) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: 'product and quantity (> 0) are required' });
        }
        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) {
            return res.status(404).send({ message: 'Inventory not found for this product' });
        }
        inventory.stock += quantity;
        await inventory.save();
        await inventory.populate({ path: 'product', select: 'title price slug' });
        res.send({ message: 'Stock added successfully', inventory });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST remove_stock - giảm stock theo quantity
router.post('/remove_stock', async function (req, res) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: 'product and quantity (> 0) are required' });
        }
        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) {
            return res.status(404).send({ message: 'Inventory not found for this product' });
        }
        if (inventory.stock < quantity) {
            return res.status(400).send({
                message: `Not enough stock. Current stock: ${inventory.stock}, requested: ${quantity}`
            });
        }
        inventory.stock -= quantity;
        await inventory.save();
        await inventory.populate({ path: 'product', select: 'title price slug' });
        res.send({ message: 'Stock removed successfully', inventory });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST reservation - giảm stock và tăng reserved theo quantity
router.post('/reservation', async function (req, res) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: 'product and quantity (> 0) are required' });
        }
        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) {
            return res.status(404).send({ message: 'Inventory not found for this product' });
        }
        if (inventory.stock < quantity) {
            return res.status(400).send({
                message: `Not enough stock to reserve. Current stock: ${inventory.stock}, requested: ${quantity}`
            });
        }
        inventory.stock -= quantity;
        inventory.reserved += quantity;
        await inventory.save();
        await inventory.populate({ path: 'product', select: 'title price slug' });
        res.send({ message: 'Reservation successful', inventory });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST sold - giảm reserved và tăng soldCount theo quantity
router.post('/sold', async function (req, res) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: 'product and quantity (> 0) are required' });
        }
        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) {
            return res.status(404).send({ message: 'Inventory not found for this product' });
        }
        if (inventory.reserved < quantity) {
            return res.status(400).send({
                message: `Not enough reserved quantity. Current reserved: ${inventory.reserved}, requested: ${quantity}`
            });
        }
        inventory.reserved -= quantity;
        inventory.soldCount += quantity;
        await inventory.save();
        await inventory.populate({ path: 'product', select: 'title price slug' });
        res.send({ message: 'Sold successfully', inventory });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
