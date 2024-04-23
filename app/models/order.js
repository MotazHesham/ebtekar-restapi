const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema(
    {
        user: {
            name: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            },
            phone_number: {
                type: String,
                required: true
            },
            userId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "User"
            }
        },
        products: [
            {
                product: {
                    type: Object,
                    required: true
                },
                quantity: { type: Number, required: true }
            }
        ],
        totalCost: { type: Number, required: true },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
