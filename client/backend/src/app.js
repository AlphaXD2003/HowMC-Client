const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// setup the middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

//import routes
const userRouter = require("./routes/user.routes");
const eggRouter = require("./routes/eggs.routes");
const serverRouter = require("./routes/server.routes");
const pteroRouter = require("./routes/pterouser.routes");
const nodeRouter = require("./routes/nodes.routes");
const locationROuter = require('./routes/location.routes')
const clientRouter = require('./routes/client/client.routes')
const accountRouter = require('./routes/client/account.routes')
const clientServerRouter = require('./routes/client/server.routes')
const razorpayRouter = require('./routes/razorpay.routes')
const syncRouter = require('./routes/sync.routes')
const blogRouter = require('./routes/blogs/blogs.routes')
const mailRouter = require('./routes/mail/mail.routes')
//declare routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/eggs", eggRouter);
app.use("/api/v1/servers", serverRouter);
app.use("/api/v1/pterouser", pteroRouter);
app.use("/api/v1/nodes", nodeRouter);
app.use('/api/v1/location', locationROuter)


app.use('/api/v1/client',clientRouter )
app.use('/api/v1/account', accountRouter)

app.use('/api/v1/client/server', clientServerRouter)


// orders
app.use('/api/v1/order', razorpayRouter)

// sync the database with the pterodactyl panel
app.use('/api/v1/sync', syncRouter)

// blog
app.use('/api/v1/blogs', blogRouter)

// send email
app.use('/api/v1/mail', mailRouter)

module.exports = { app };
