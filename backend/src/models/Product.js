// models/Product.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        description: { type: String },
        status: { type: String, enum: ['ativo', 'inativo'], default: 'ativo' }, 
        stock: { type: Number, required: true, min: 0 },
    },
    {
        timeseries: true,
        versionKey:false,
    }
);

module.exports = mongoose.model('Product', ProductSchema);
