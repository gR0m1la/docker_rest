const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    type:{
        type: String,
        required:true,
    },
    imgSrc:{
        type: String,
        required:true,
    },
    title:{
        type: String,
        required:true,
    },
    grammar:{
        type: String,
        required:true,
    },
    price:{
        type: Number,
        required:true,
    },
    desc:{
        type: String,
        required:true,
    },
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
