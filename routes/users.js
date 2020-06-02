const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const usersController = require("../controller/usersController");

// LOGIN USER
router.post("/login", (req, res) => usersController.login(req, res));

// GET ONE USER
router.get("/get_one", auth.authUser, (req, res) =>
  usersController.getOne(req, res)
);

// GET ALL USERS
router.get("/", auth.authAdmin, (req, res) => usersController.getAll(req, res));

// CREATE USER
router.post("/", auth.authAdmin, (req, res) =>
  usersController.create(req, res)
);

// DELETE USER
router.post("/delete", auth.authAdmin, (req, res) =>
  usersController.remove(req, res)
);

// SEARCH USERS
router.get("/search", auth.authAdmin, (req, res) =>
  usersController.search(req, res)
);

module.exports = router;
