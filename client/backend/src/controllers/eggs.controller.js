const chalk = require("chalk");
const { ApiErrors } = require("../utils/ApiErrors");
const { ApiResponse } = require("../utils/ApiResponse");
const { getPteroEgg, getServerOfEgg: getSEgg } = require("../utils/PteroEggs");
const Egg = require("../models/eggs.model");
const Server = require("../models/server.model");

const getEggInfo = async (req, res) => {
  const { nestId, eggId } = req.params;
  console.log(
    chalk.bgGreen(
      "Getting egg info for eggId: ",
      eggId,
      " and nestId: ",
      nestId
    )
  );
  try {
    const [eggInfo, eggError] = await getPteroEgg(eggId, nestId);

    if (eggError) {
      throw new ApiErrors(404, "Egg not found");
    }
    return res.status(200).json(new ApiResponse(200, eggInfo, "Egg found"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(error.statusCode, error.data, error.message, error)
      );
  }
};

const getServerOfEgg = async (req, res) => {
  const { eggId, nestId } = req.params;
  try {
    const [eggInfo, eggError] = await getSEgg(eggId, nestId);
    if (eggError) {
      throw new ApiErrors(404, "Egg not found");
    }
    return res.status(200).json(new ApiResponse(200, eggInfo, "Egg found"));
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
  getEggInfo,
  getServerOfEgg,
};
