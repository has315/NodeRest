const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const votersController = require("../controller/votersController");

// GET ONE
router.get("/get_one", auth.authUser, (req, res) =>
  votersController.getOne(req, res)
);

// GET ALL NON DELETED VOTES
router.get("/all", auth.authUser, (req, res) =>
  votersController.getAll(req, res)
);

// INSERT NEW VOTE
router.post("/", auth.authUser, (req, res) =>
  votersController.create(req, res)
);

// UPDATE VOTE
router.post("/update", auth.authAdmin, (req, res) =>
  votersController.update(req, res)
);

// DELETE VOTE
router.post("/delete", auth.authAdmin, (req, res) =>
  votersController.remove(req, res)
);

// SEARCH VOTES
router.get("/search", auth.authUser, (req, res) =>
  votersController.search(req, res)
);

// INSERT EDITED VOTE
router.post("/edit_request", auth.authUser, (req, res) =>
  votersController.createEditReq(req, res)
);

// GET ALL EDITED VOTES
router.get("/get_edit", auth.authAdmin, (req, res) =>
  votersController.getAllEditReq(req, res)
);

// DECLINE AND DELETE VOTE EDIT ENTRY
router.post("/edit_request_delete", auth.authAdmin, (req, res) =>
  votersController.removeEditReq(req, res)
);

// SETS FLAG FOR DELETION
router.post("/delete_request", auth.authUser, (req, res) =>
  votersController.createDelReq(req, res)
);

// GET ALL DELETE REQUESTS
router.get("/get_deleted", auth.authAdmin, (req, res) =>
  votersController.getAllDelReq(req, res)
);

// DECLINE DELETE AND  SETS DELETION FLAG TO 0
router.post("/delete_decline", auth.authAdmin, auth.authUser, (req, res) =>
  votersController.removeDelReq(req, res)
);

module.exports = router;
