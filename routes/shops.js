const express = require('express');
const router = express.Router();
const {getShops, getShop, createShop, updateShop, deleteShop} = require('../controllers/shops');

//Include other resource routers
const reservationRouter = require('./reservations');

const {protect,authorize} = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:shopId/reservations', reservationRouter);

router.route('/').get(getShops).post(protect, authorize('admin'), createShop);
router.route('/:id').get(getShop).put(protect, authorize('admin'), updateShop).delete(protect, authorize('admin'), deleteShop);

module.exports = router;