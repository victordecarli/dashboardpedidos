// models/Order.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        products: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true, min: 1 },
            }
        ],
        total: { type: Number, required: true },
        status: {
            type: String,
            enum: ['processando', 'finalizado'],
            default: 'processando',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


module.exports = mongoose.model('Order', OrderSchema);
