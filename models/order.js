const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    telnum: {
        type: String,
        required: true,
    },
    emailaddress: {
        type: String,
        required: true,
        lowercase: true,
    },
    subject: {
        type: String,
        required: true,
    },
    login: {
        type: String,
        required: true,
    },
    items: {
        type: String,
        required: true,
    },
    sum:{
        type: Number,
        required: true,
    },
    status:{
        type: String,
        required: true
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
