const RentRequest = require('../models/RentRequest.model.js');


// Create a new rent request
exports.createRequest = async (req, res) => {
  try {
    const request = new RentRequest(req.body);
    await request.save();

    res.status(201).json({
      success: true,
      message: "Rent request created successfully",
      data: request,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create rent request",
      error: error.message,
    });
  }
};


// Get all requests made by a specific renter
exports.getRequestsByUser = async (req, res) => {
  try {
    const renterId = req.params.renterId;
    if (!renterId) {
      return res.status(400).json({ success: false, message: "Renter ID is required" });
    }

    const requests = await RentRequest.find({ renterId })
      .populate('itemId')
      .populate('ownerId');

    res.status(200).json({
      success: true,
      message: "Requests fetched successfully for renter",
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching renter requests",
      error: error.message,
    });
  }
};


// Get all requests for an owner
exports.getRequestsForOwner = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    if (!ownerId) {
      return res.status(400).json({ success: false, message: "Owner ID is required" });
    }

    const requests = await RentRequest.find({ ownerId })
      .populate('itemId')
      .populate('renterId');

    res.status(200).json({
      success: true,
      message: "Requests fetched successfully for owner",
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching owner requests",
      error: error.message,
    });
  }
};


// Update request status (approve/reject)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!requestId || !status) {
      return res.status(400).json({ success: false, message: "Request ID and status are required" });
    }

    const updatedRequest = await RentRequest.findByIdAndUpdate(
      requestId,
      {
        status,
        activeAt: status === 'Active' ? new Date() : null,
      },
      { new: true, runValidators: true });

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({
      success: true,
      message: `Request status updated to ${status}`,
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating request status",
      error: error.message,
    });
  }
};


// Reject a request
exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!requestId) {
      return res.status(400).json({ success: false, message: "Request ID is required" });
    }

    // Update only the status to 'Rejected'
    const updatedRequest = await RentRequest.findByIdAndUpdate(
      requestId,
      { status: 'Rejected', rejectedAt: new Date() },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }

    res.status(200).json({
      success: true,
      message: "Request rejected successfully",
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error rejecting request",
      error: error.message,
    });
  }
};


// Delete a request 
exports.deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!requestId) {
      return res.status(400).json({ success: false, message: "Request ID is required" });
    }

    const deleted = await RentRequest.findByIdAndDelete(requestId);

    if (!deleted) return res.status(404).json({ success: false, message: "Request not found" });

    res.status(200).json({
      success: true,
      message: "Request deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting request",
      error: error.message,
    });
  }
};


// Get all requests made by all renters (for Admin)
exports.getAllRequestsByUsers = async (req, res) => {
  try {
    const requests = await RentRequest.find()
      .populate('itemId')     // item info
      .populate('ownerId')    // owner info
      .populate('renterId');  // renter info

    res.status(200).json({
      success: true,
      message: "All requests fetched successfully (by users)",
      data: requests,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching all renter requests",
      error: error.message,
    });
  }
};


// Get all requests received by owners (for Admin)
exports.getAllRequestsForOwners = async (req, res) => {
  try {
    const requests = await RentRequest.find()
      .populate('itemId')
      .populate('renterId')
      .populate('ownerId');

    res.status(200).json({
      success: true,
      message: "All requests fetched successfully (for owners)",
      data: requests,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching all owner requests",
      error: error.message,
    });
  }
};
