const bcrypt = require("bcrypt");
const db = require("../models/index");
const User = db.User;
const { Op, QueryTypes } = require("sequelize");
const { sequelize } = require("../models/index");

// exports.getAllUsers = async (req, res) => {
//     try {
//         let { searchKey, pageSize, pageIndex, sortBy } = req.body;
//         // console.log("userDetails=======>", req.user.id);
//         const sortBys = ["firstName", "lastName"];
//         if (sortBy && !sortBys.includes(sortBy)) {
//             return res.status(401).json({ message: "Invalid SortBy!" });
//         }
//         pageSize = parseInt(pageSize) || 5;
//         pageIndex = parseInt(pageIndex) || 1;
//         const offset = (pageIndex - 1) * pageSize;

//         // Check if searchKey is empty or just spaces
//         if (searchKey && searchKey.trim() === "") {
//             return res.status(200).json({
//                 totalUsers: 0,
//                 totalPages: 0,
//                 currentPage: pageIndex,
//                 users: []
//             })
//         }

//         const whereCondition = searchKey
//             ? {
//                 [Op.or]: [
//                     { firstName: { [Op.like]: `%${searchKey}%` } },
//                     { lastName: { [Op.like]: `%${searchKey}%` } },
//                     { email: { [Op.like]: `%${searchKey}%` } }
//                 ]
//             }
//             : {};

//         const { count, rows } = await User.findAndCountAll({
//             where: whereCondition,
//             offset,
//             limit: pageSize,
//             // order: [["createdAt", "DESC"]]
//             order: [sortBy]
//         })

//         return res.status(200).json({
//             totalUsers: count,
//             totalPages: Math.ceil(count / pageSize),
//             currentPage: pageIndex,
//             users: rows
//         });
//     } catch (err) {
//         console.error({ message: err });
//     }
// }

exports.getAllUsers = async (req, res) => {
    try {
        let { pageSize, pageIndex, searchKey, sortBy } = req.body;
        const sortBys = ["firstName", "lastName"];
        if (sortBy && !sortBys.includes(sortBy)) {
            return res.status(401).json({ message: "Invalid sortBy!" });
        }
        pageSize = parseInt(pageSize) || 10; // Ensure pageSize is a number
        pageIndex = parseInt(pageIndex) || 1; // Ensure pageIndex is a number

        const offset = (pageIndex - 1) * pageSize;

        searchKey = searchKey ? `%${searchKey}%` : "%%"; // Ensure it's a wildcard search string

        let query = `
        SELECT 
            users.id as userId,
            users.firstName,
            users.lastName,
            users.email,
            users.createdAt,
            users.updatedAt
        FROM 
            users
        WHERE 
               ( 
                    users.firstName LIKE :searchKey OR
                    users.lastName LIKE :searchKey OR
                    users.email LIKE :searchKey 
                )
        ${sortBy ? `ORDER BY ${sortBy} ASC` : ""}
       `;

        let result = {};

        const data = await sequelize.query(query, {
            replacements: { searchKey },
            type: QueryTypes.SELECT
        });

        result.count = data.length;

        query = query + `LIMIT ${offset},${pageSize}`;

        result.rows = await sequelize.query(query, {
            replacements: { searchKey },
            type: QueryTypes.SELECT
        });

        return res.status(200).json(result);
    } catch (err) {
        console.error({ message: err });
    }
}

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const findUser = await User.findByPk(id);
        if (!findUser) return res.status(404).json({ message: "UserNot found!" });
        return res.status(200).json(findUser);
    } catch (err) {
        console.error({ message: err });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        // const userId = req.params.id; // User ID from the URL parameter
        const loggedInUserId = req.user.id; // User ID from the token (set in verifyUser middleware)

        if (parseInt(id) !== parseInt(loggedInUserId)) {
            return res.status(403).json({ message: "You can only update your own profile!" });
        }
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "User Not Found" });
        const { firstName, lastName, email, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        const updatedUser = await User.update({ firstName, lastName, email, password: hashPassword }, { where: { id } });
        // await User.save();

        return res.status(200).json({ message: "User Updated Seccessfully!", updatedUser });
    } catch (err) {
        console.error({ message: err });
    }
}


exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "User Not Found! " });
        const deletedUser = await User.destroy({ where: { id } });
        return res.status(200).json({ message: "User Deleted Successfully!", deletedUser });
    } catch (err) {
        console.error({ message: err });
    }
}