const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        imageUrl: {
            type: String,
            default: "https://via.placeholder.com/150",
            get:(val) => `${process.env.URL}/`+val //concatenate the domain with the path from db 
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            default:0,
        },
        published: {
            type: Boolean,
            default: 1
        },
        category: {
            required: true,
            type: Schema.Types.ObjectId,
            ref: "Category"
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true ,toJSON: { getters: true } } 
);

module.exports = mongoose.model("Product", productSchema);
