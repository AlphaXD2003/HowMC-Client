require("dotenv").config({
  path: "./.env",
});

const { app } = require("./app");
const connectDB = require("./db/db");
const chalk = require("chalk");
const { syncDBwithPtero } = require("./utils/SyncDBwithPtero");
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        chalk.cyan(`Server is running on http://localhost:${process.env.PORT}`)
      );
    });

  })
  .catch((err) => {
    console.error(chalk.red(`Error: ${err.message}`));
  });
