const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const votersController = require("../controller/votersController");

// GET ONE
router.get("/get_one", auth.authUser, votersController.getOne);

// GET ALL NON DELETED VOTES
router.get("/all", auth.authUser, votersController.getAll); //change the method to post

// INSERT NEW VOTE
router.post("/", auth.authUser, votersController.create);

// UPDATE VOTE
router.post("/update", auth.authAdmin, votersController.update);

// UPDATE STATUS
router.post("/updateStatus", auth.authAdmin, votersController.updateStatus);


// DELETE VOTE
router.post("/delete", auth.authAdmin, votersController.remove);

// SEARCH VOTES
router.get("/search", auth.authUser, votersController.search);

// INSERT EDITED VOTE
router.post("/edit_request", auth.authUser, votersController.createEditReq);

// GET ALL EDITED VOTES
router.get("/get_edit", auth.authAdmin, votersController.getAllEditReq);

// ACCEPT EDITED VOTE
router.post(
    "/edit_request_accept",
    auth.authUser,
    votersController.acceptEditReq
);

// DECLINE AND DELETE VOTE EDIT ENTRY
router.post(
    "/edit_request_delete",
    auth.authAdmin,
    votersController.removeEditReq
);

// SETS FLAG FOR DELETION
router.post("/delete_request", auth.authUser, votersController.createDelReq);

// GET ALL DELETE REQUESTS
router.get("/get_deleted", auth.authAdmin, votersController.getAllDelReq);

router.get("/get_votes_on_mobile", auth.authUser, votersController.getVotesMobile);


// DECLINE DELETE AND  SETS DELETION FLAG TO 0
router.post(
    "/delete_decline",
    auth.authAdmin,
    auth.authUser,
    votersController.removeDelReq
);

module.exports = router;