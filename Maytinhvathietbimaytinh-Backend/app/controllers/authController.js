'use strict'
const UserModel = require('../models/user')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const _const = require('../config/constant');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: 'h5studiogl@gmail.com',
        pass: 'fScdnZ4WmEDqjBA1',
    },
});

const authController = {
    registerUser: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            const checkEmailExist = await UserModel.findOne({ email: req.body.email });
            if (checkEmailExist) return res.status(200).json('Email is exist');

            const token = jwt.sign({ email: req.body.email }, 'secret_key', { expiresIn: '1h' });

            const newUser = await new UserModel({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
                phone: req.body.phone,
                role: req.body.role,
                status: req.body.status
            });
           

            const user = await newUser.save();
            res.status(200).json(user);

        } catch (err) {
            res.status(500).json("Register fails");
        }
    },

    verifyAccount: async (req, res) => {
        try {
            const { token } = req.query;

            // Verify the token
            const decoded = jwt.verify(token, 'secret_key');

            // Find the user by email and update the status
            const user = await UserModel.findOneAndUpdate({ email: decoded.email }, { status: 'actived' });

            if (!user) {
                return res.status(404).json({ message: 'User not found', status: false });
            }

            res.status(200).json({ message: 'Account verified successfully', status: true });
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(400).json({ message: 'Token has expired', status: false });
            }
            console.error(err);
            res.status(500).json({ message: 'Verification failed', status: false });
        }
    },

    login: async (req, res) => {
        try {
            const user = await UserModel.findOne({ email: req.body.email });
            if (!user) {
                return res.status(400).json({ message: "Unregistered account!", status: false });
            }

            const validatePassword = await bcrypt.compareSync(req.body.password, user.password);

            if (!validatePassword) {
                res.status(400).json({ message: "wrong password!", status: false });
            }
            if (user && validatePassword) {
                const token = jwt.sign({ user: user }, _const.JWT_ACCESS_KEY, { expiresIn: 10000000 });
                res.header('Authorization', token);
                res.status(200).json({ user, token, status: true });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    }
}

module.exports = authController;