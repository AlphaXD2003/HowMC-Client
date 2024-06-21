const Razorpay = require("razorpay");
const { ApiErrors } = require("../utils/ApiErrors");
const { ApiResponse } = require("../utils/ApiResponse");
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
const { Order } = require("../models/");
const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount || !currency || !receipt) {
      throw new ApiErrors(400, "Invalid request");
    }
    const options = {
      amount: amount * 100,
      currency,
      receipt,
      payment_capture: 1,
    };

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create(options);
    console.log(order);
    // Save order to database
    await Order.create({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      coins: amount,
      buyer: req.user._id,
      status: "created",
      amountPaid: order.amount_paid,
    });
    return res.status(200).json(new ApiResponse(200, order, "Order created"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(error.statusCode, error.data, error.message, error)
      );
  }
};

const verifyPayment = async (req, res) => {
  const crypto = require("crypto");
  try {
    const { order_id, payment_id, signature } = req.body;

    if ([order_id, payment_id, signature].includes(undefined)) {
      throw new ApiErrors(400, "Invalid request");
    }
    const expectedSecret = await crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");
    if (expectedSecret !== signature) {
      // save database as failed
      await Order.findOneAndUpdate(
        { order_id },
        { status: "failed" },
        { new: true }
      );

      throw new ApiErrors(400, "Invalid signature");
    }

    // Save order to database
    await Order.findOneAndUpdate(
      { order_id },
      { status: "paid", amountPaid: this.amount },
      { new: true }
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          order_id,
          payment_id,
        },
        "Payment verified"
      )
    );
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(error.statusCode, error.data, error.message, error)
      );
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
