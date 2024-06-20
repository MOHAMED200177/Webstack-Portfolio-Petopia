const Customer = require('./../models/CustomerModle');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};


exports.signup = catchAsync(async (req, res, next) => {
    const newCustomer = await Customer.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const token = signToken(newCustomer._id);
    res.status(201).json({
        status: 'succes',
        token,
        DATA: {
            Customer: newCustomer
        }
    });
});


exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const customer = await Customer.findOne({ email }).select('+password');

    if (!customer || !(await customer.correctPassword(password, customer.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    const token = signToken(customer._id);
    res.status(201).json({
        status: 'succes',
        DATA: {
            token
        }
    });
});






















// exports.createCustomer = async (req, res) => {
//     try {
//         const newCustomer = await Customer.create(req.body);
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 customer: newCustomer
//             }
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// };

exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json({
            status: 'success',
            results: customers.length,
            data: {
                customers
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.getCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({
                status: 'fail',
                message: 'No customer found with that ID'
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                customer
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!customer) {
            return res.status(404).json({
                status: 'fail',
                message: 'No customer found with that ID'
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                customer
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({
                status: 'fail',
                message: 'No customer found with that ID'
            });
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

