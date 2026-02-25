const mongoose = require('mongoose');

const MassageReservationSchema = new mongoose.Schema({
    reserveDate: {
        type:Date,
        required:true
    },
    reserveTime:{
        type:String,
        required:true
    },
    user: {
        type:mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    },
    shop: {
        type:mongoose.Schema.ObjectId,
        ref: 'Shop',
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports=mongoose.model('Reservation', MassageReservationSchema);