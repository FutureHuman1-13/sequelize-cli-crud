const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById,updateUser, deleteUser } = require("../controllers/userController");
const { verifyUser } = require("../middleware/verifyJwt")

router.get("/users",verifyUser, getAllUsers);
router.get("/users/:id", getUserById);
router.put("/user/update/:id", verifyUser,updateUser);
router.delete('/user/delete/:id', deleteUser);

module.exports = router;

