const {Router} = require('express')

const { createOrder, verifyPayment } = require('../controllers/razorpay.controller')
const { verifyJWT } = require('../middlewares/auth.middleware')

const router = Router()

router.route('/create').post(verifyJWT ,createOrder)
router.route('/verify').post(verifyJWT ,verifyPayment)

module.exports = router