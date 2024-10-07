const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
    parkingId : {
        type: String,
        required: true,
    },
    userID : {
        type: String,
        required: true,
    },
    packageType : {
        type: String,
        required: true,
    },
    bookingDate : {
        type: String,
        required : true,
    },
    price : {
        type: Number,
        required: true,
    },
    vehicleNumber : {
        type: String,
        required: true,
    },status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'approved', // Default status when created
    }

}, { timestamps: true });

const parkingModel = mongoose.model("parkings", parkingSchema);
module.exports = parkingModel;