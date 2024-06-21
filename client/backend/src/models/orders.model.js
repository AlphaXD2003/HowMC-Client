const { Types, Schema, model } = require("mongoose");

const OrderSchema = new Schema({
    order_id: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    receipt: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "created",
        enum: ["created", "paid", "failed"]
    },
    buyer: {
        type: Types.ObjectId,
        ref: "User"
    },
    coins: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        default: 0
    }

}, { timestamps: true })

const Order = model("Order", OrderSchema);
module.exports = Order;