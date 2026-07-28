const userModel = require("../models/user.model")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");
const tokenBlackListModel = require("../models/blacklist.model");

/**
 * @name registerUserController
 * @description register a new username , email and password in the request
 * @param {*} req 
 * @param {*} res 
 */
async function registerUserController(req, res) {
    try {


        const { username, email, password } = req.body
        //check if the username ,email and password is null or not 
        if (!username || !password || !email) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }
        // finding the user either by username or email
        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        })
        if (isUserAlreadyExists) {

            return res.status(400).json({
                message: "Account already exist with this email or username"
            })
        }
        const hash = await bcrypt.hash(password, 10)
        const user = await userModel.create({
            username,
            email,
            password: hash
        })
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.cookie("token", token)
        res.status(201).json({
            message: "user registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }

        })
    }
    catch (error) {
        console.error("error in registerUserController:", error)
        return res.status(500).json({
            message: "Internal server error"
        });

    }
}

/**
 * @name loginUserController
 * @description login a user , expects email and a password in the request body
 * @access Public
 */

async function loginUserController(req, res) {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if (!user) {
        res.status(400).json({
            message: " Invalid email or password "
        })
    }
    const isPasswordvalid = await bcrypt.compare(password, user.password)
    if (!isPasswordvalid) {
        return res.status(400).json({
            message: "Invalid email or passowrd"
        })
    }
    const token = jwt.sign({
        id: user._id, username: user.username
    }, process.env.JWT_SECRET,
        { expiresIn: '1d' })

    res.cookie("token", token);

    res.status(200).json({
        message: "user logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email

        }
    })
}

/**
 * @name logoutUserController
 * @description logout a user by blacklisting the token and clearing the token from user cookie 
 * @access public
 * 
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token
    if (token) {
        await tokenBlackListModel.create({ token })
    }
    res.clearCookie("token")
    res.status(200).json({
        message:"User logged out succesfully"
    })


}

/**
 * @name get
 */
async function getMeController(req,res) {
    const user = await userModel.findById(req.user.id)
    res.status(200).json({
        message:"user details fetched successfully.",

        user:{
            id:user._id,
            username: user.username,
            email:user.email
        }
    })
    
}




module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}