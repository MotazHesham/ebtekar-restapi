const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone_number: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        user_type :{
            type:String,
            default:'client'
        },
        passwordToken: {
            type:String, 
            default: null
        },
        passwordResetExpires: {
            type:String, 
            default: null
        },
        cart: {
            items: [
                {
                    productId: {
                        type: Schema.Types.ObjectId,
                        required: true,
                        ref: "Product"
                    },
                    quantity: { type: Number, required: true }
                }
            ]
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(
        (cartItem) => cartItem.productId.toString() === product._id.toString()
    );

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        });
    }
    const updatedCart = { items: updatedCartItems };
    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter(
        (item) => item.productId.toString() !== productId
    );
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function (product) {
    this.cart = { items: [] };
    return this.save();
};
module.exports = mongoose.model("User", userSchema);
