const axios = require("axios");
require("dotenv").config();

const CSC_API_BASE = "https://api.countrystatecity.in/v1";
const CSC_KEY = process.env.CSC_API_KEY;

//  Get all states of India
exports.getIndiaStates = async (req, res) => {
  try {
    const response = await axios.get(`${CSC_API_BASE}/countries/IN/states`, {
      headers: { "X-CSCAPI-KEY": CSC_KEY }
    });

    res.status(200).json({
      message: "States fetched successfully",
      data: response.data
    });
  } catch (error) {
    console.error("Error fetching states:", error.message);
    res.status(500).json({
      message: "Failed to fetch states",
      error: error.message,
    });
  }
};

//  Get cities by stateCode (India fixed)
exports.getCitiesByState = async (req, res) => {
  try {
    const { stateCode } = req.params;

    const response = await axios.get(
      `${CSC_API_BASE}/countries/IN/states/${stateCode}/cities`,
      {
        headers: { "X-CSCAPI-KEY": CSC_KEY }
      }
    );

    res.status(200).json({
      message: `Cities for state ${stateCode} fetched successfully`,
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching cities:", error.message);
    res.status(500).json({
      message: "Failed to fetch cities",
      error: error.message,
    });
  }
};

//  Get pincode by city name using India Post API
exports.getPincodeByCity = async (req, res) => {
  try {
    const { city } = req.params;

    const response = await axios.get(`https://api.postalpincode.in/postoffice/${city}`);
    if (response.data[0].Status === "Success") {
      const pincodes = response.data[0].PostOffice.map(p => p.Pincode);

      res.status(200).json({
        message: `Pincodes for city ${city} fetched successfully`,
        pincodes,
      });
    } else {
      res.status(404).json({
        message: "Pincode not found",
        data: [],
      });
    }
  } catch (error) {
    console.error("Error fetching pincode:", error.message);
    res.status(500).json({
      message: "Failed to fetch pincode",
      error: error.message,
    });
  }
};
