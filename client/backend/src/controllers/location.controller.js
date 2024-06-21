const { axios } = require("axios");
const { ApiResponse } = require("../utils/ApiResponse");
const apiUrl = `${process.env.PTEORDACTYL_URL}/api/application/locations`;
const { PTEORDACTYL_KEY } = process.env;
const {Location} = require('../models/')
const headers = {
  Authorization: `Bearer ${PTEORDACTYL_KEY}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

const getAllLocations = async (req, res) => {
  try {
    const locationsRes = await axios.get(apiUrl, {
      headers,
    });
    res.status(200).json(new ApiResponse(200, locationsRes.data));
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal server error"
        )
      );
  }
};

const getLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const locationRes = await axios.get(`${apiUrl}/${id}`, {
      headers,
    });
    res.status(200).json(new ApiResponse(200, locationRes.data));
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal server error"
        )
      );
  }
};

const getNodesOfLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const locationRes = await axios.get(`${apiUrl}/${id}?include=nodes`, {
      headers,
    });
    res.status(200).json(new ApiResponse(200, locationRes.data));
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal server error"
        )
      );
  }
};

const createLocation = async (req, res) => {
  const { name, short, long } = req.body;
  try {
    const locationRes = await axios.post(
      apiUrl,
      { name, short, long },
      {
        headers,
      }
    );
    // Insert into database
    await Location.create({
      id: locationRes.data.attributes.id,
      short: locationRes.data.attributes.short,
      long: locationRes.data.attributes.long,
    })

    res.status(201).json(new ApiResponse(201, locationRes.data));
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal server error"
        )
      );
  }
};

const updateLocation = async (req, res) => {
  const { id } = req.params;
  const { name, short, long } = req.body;
  try {
    const locationRes = await axios.put(
      `${apiUrl}/${id}`,
      { name, short, long },
      {
        headers,
      }
    );
    // Update in database
    await Location.findOneAndUpdate(
      { id },
      { short, long },
      { new: true }
    );
    res.status(200).json(new ApiResponse(200, locationRes.data));
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal server error"
        )
      );
  }
};
const deleteLocation = async (req, res) => {
  const { id } = req.params;
  try {
    await axios.delete(`${apiUrl}/${id}`, {
      headers,
    });
    // Delete from database
    await Location.findOneAndDelete({ id });
    res
      .status(200)
      .json(new ApiResponse(200, true, "Location deleted successfully"));
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal server error"
        )
      );
  }
};

module.exports = {
  getAllLocations,
  getLocation,
  getNodesOfLocation,
  createLocation,
  updateLocation,
  deleteLocation
};
