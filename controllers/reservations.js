const Reservation = require('../models/Reservation');
const Shop = require('../models/Shop');

//@desc   Get all reservations
//@route  GET /api/v1/reservations
//@access Private
exports.getReservations = async (req,res,next) => {
    let query;
    //General users can see only their reservations
    if(req.user.role !== 'admin'){
        query=Reservation.find({user:req.user.id}).populate({
            path:'shop',
            select:'name tel'
        });
    }
    else{
        //If you are an admin you can see all!
        if(req.params.shopId){
            console.log(req.params.shopId);
            query=Reservation.find({shop:req.params.shopId}).populate({
                path:'shop',
                select:'name tel'
            });
        }
        else{
            query=Reservation.find().populate({
                path:'shop',
                select:'name tel'
            });
        }
    }
    try{
        const reservations = await query;

        res.status(200).json({success:true,count:reservations.length,data:reservations})
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message:"Cannot find Reservation"});
    }
};

//@desc   Get single reservations
//@route  GET /api/v1/reservations/:id
//@access Public
exports.getReservation = async (req,res,next) => {
    try{
        const reservation = await Reservation.findById(req.params.id).populate({
            path:'shop',
            select: 'name tel'
        });

        if(!reservation){
            return res.status(404).json({success:false, message:`No reservation with the id of ${req.params.id}`});
        }
        res.status(200).json({success:true,data:reservation});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message:"Cannot find Reservation"});
    }
};

//@desc   Add reservation
//@route  POST /api/v1/shops/:shopId/reservations
//@access Private
exports.addReservation = async (req,res,next) => {
    try{
        req.body.shop=req.params.shopId;

        const shop = await Shop.findById(req.params.shopId);

        if(!shop){
            return res.status(404).json({success:false, message:`No shop with the id of ${req.params.shopId}`});
        }

        //add user Id to req.body
        req.body.user=req.user.id;

        //Cannot reserve past date
        if(new Date(req.body.reserveDate) < new Date()){
            return res.status(400).json({success:false,message:'Cannot reserve past date'});
        }

        //cannot reserve when it not openTime
        const toMin = (t) => {
            const [h,m] = t.split(':').map(Number);
            return h*60 + m;
        };

        const reserveMin = toMin(req.body.reserveTime);
        const openMin = toMin(shop.openTime);
        const closeMin = toMin(shop.closeTime);

        if(reserveMin < openMin || reserveMin > closeMin){
        return res.status(400).json({success:false,message:'Shop is closed at this time'});
        }

        //Check for existed reservation
        const existedReservations = await Reservation.find({user:req.user.id});

        //If the user is not an admin, they can only create 3 reservation.
        if(existedReservations.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 reservations`});
        }

        const reservation = await Reservation.create(req.body);
        res.status(200).json({success:true,data:reservation});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message:"Cannot create Reservation"});
    }
};

//@desc   Update reservation
//@route  PUT /api/v1/reservations/:id
//@access Private
exports.updateReservation = async (req,res,next) => {
    try{
        let reservation = await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({success:false,message:`No reservation with the id of ${req.params.id}`});
        }

        //Make sure user is the reservation owner
        if(reservation.user.toString()!==req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false, message:`User ${req.user.id} is not authorized to update this reservation`})
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        res.status(200).json({success:true,data:reservation});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message:"Cannot update Reservation"});
    }
};

//@desc   Delete reservation
//@route  DELETE /api/v1/reservations/:id
//@access Private
exports.deleteReservation = async (req,res,next) => {
    try{
        const reservation = await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({success:false,message:`No reservation with the id of ${req.params.id}`});
        }

        //Make sure user is the reservation owner
        if(reservation.user.toString()!==req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false, message:`User ${req.user.id} is not authorized to delete this reservation`})
        }

        await reservation.deleteOne();
        res.status(200).json({success:true,data:{}});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message:"Cannot delete Reservation"});
    }
};