const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const usersController = require("../controller/usersController");

// LOGIN USER
router.post("/login", usersController.login);

// GET ONE USER
router.get("/get_one", auth.authUser, usersController.getOne);

// GET ALL USERS
router.get("/", auth.authAdmin, usersController.getAll);

// CREATE USER
router.post("/", auth.authAdmin, usersController.create);

// DELETE USER
router.post("/delete", auth.authAdmin, usersController.remove);

// SEARCH USERS
router.get("/search", auth.authAdmin, usersController.search);

module.exports = router;
