let mongoose = require('mongoose');

let productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String
    },
    price: {
        type: Number,
        min: 0,
        default: 0
    },
    description: {
        type: String,
        default: true,
        maxLength: 999
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'category',
        required: true
    },
    images: {
        type: [String],
        default: [
            "https://placeimg.com/640/480/any"
        ]
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})
// Auto-create Inventory when a new Product is saved
productSchema.post('save', async function (doc) {
    try {
        let inventoryModel = require('./inventories');
        let existing = await inventoryModel.findOne({ product: doc._id });
        if (!existing) {
            await inventoryModel.create({ product: doc._id });
        }
    } catch (err) {
        console.error('Error auto-creating inventory:', err.message);
    }
});

module.exports = mongoose.model('product', productSchema);