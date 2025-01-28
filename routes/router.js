import express from "express";
import Sport from "../schemas/sports.js";
import bcrypt from "bcrypt";
import User_account from "../schemas/user_account.js";
import Developer_account from "../schemas/developer_account.js";
import mongoose from "mongoose";
const fitmate_router = express.Router();

fitmate_router.get('/', async (req, res) => {
    if(!req.query.api_key) {
        res.status(403).json({
            title: "Access denied",
            message: "API key not provided!"
        })
        return;
    }
    if(!await check_key(req.query.api_key)) {
        res.status(403).json({
            title: "Access denied",
            message: "API key invalid!"
        })
        return;
    }
    try {

        res.status(200).json({"message": "Connection successful!" });
    } catch (err) {
        res.status(500).json({
            title: "internal error",
            message: err.message
        })
    }
})

fitmate_router.post('/add_sport', async (req, res) => {
    if(!req.query.api_key) {
        res.status(403).json({
            title: "Access denied",
            message: "API key not provided!"
        })
        return;
    }
    if(!await check_key(req.query.api_key)) {
        res.status(403).json({
            title: "Access denied",
            message: "API key invalid!"
        })
        return;
    }
    if(req.query.name == null || req.query.category == null ) {
        res.status(400).json({
            title: "Bad Request",
            message: "missing name or category!"
        })
        return;
    }
    const new_sport = new Sport({
        name: req.query.name,
        category: req.query.category,
    })

    try {
        const saved_sport = await new_sport.save()
        res.status(201).json(saved_sport)
    } catch (err) {

        res.status(500).json({
            title: "internal error",
            message: err.message
        })
    }
})

fitmate_router.post('/add_user', async (req, res) => {
    if( req.body.email == null ||
        req.body.login == null ||
        req.body.password == null ||
        req.body.bmi == null ||
        req.body.height == null ||
        req.body.weight == null)
    {
        res.status(400).json({
            title: "Bad Request",
            message: "missing parameters!"
        })
        return;
    }

    if(!req.query.api_key) {
        res.status(403).json({
            title: "Access denied",
            message: "API key not provided!"
        })
        return;
    }
    if(!await check_key(req.query.api_key)) {
        res.status(403).json({
            title: "Access denied",
            message: "API key invalid!"
        })
        return;
    }
    if(!await check_login_availability(req.body.login)) {
        res.status(409).json({
            title: "Access denied",
            message: "login already taken!"
        })
        return;
    }
    if(!await check_email_availability(req.body.email)) {
        res.status(409).json({
            title: "Access denied",
            message: "email already taken!"
        })
        return;
    }
    let password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(password, salt);

    let new_user = new User_account( {
        email: req.body.email,
        login: req.body.login,
        password_hashed: hashed_password,
        password_salt: salt,
        bmi: req.body.bmi,
        height: req.body.height,
        weight: req.body.weight,
        date_created: get_date(),
        last_active: get_date()
    });

    try {
        const saved_user = await new_user.save()
        res.status(201).json(`saved user ${saved_user.login}`);
    } catch (err) {

        res.status(500).json({
            title: "internal error",
            message: err.message
        })
    }
})

fitmate_router.post('/dev_add', async (req, res)=> {
    if(!req.query.api_key) {
        res.status(403).json({
            title: "Access denied",
            message: "API key not provided!"
        })
        return;
    }
    if(!await check_key(req.query.api_key)) {
        res.status(403).json({
            title: "Access denied",
            message: "API key invalid!"
        })
        return;
    }
    if(req.query.email == null || req.query.key_name == null) {
        res.status(400).json({
            title: "Bad Request",
            message: "missing name or category!"
        })
        return;
    }
    const new_dev = new Developer_account({
        email: req.query.email,
        key_name: req.query.key_name,
        date_created: get_date(),
        call_count: 0
    })

    try {
        const saved_dev = await new_dev.save()
        res.status(201).json({
            message: `${saved_dev}\n\n\tSave your api key! ${saved_dev.api_key}`,
        })
    }catch(err){
        res.status(500).json({
            title: "internal error",
            message: err.message
        })
    }
})

fitmate_router.get('/all_sports', async (req, res) => {
    if(!req.query.api_key) {
        res.status(403).json({
            title: "Access denied",
            message: "API key not provided!"
        })
        return;
    }
    if(!await check_key(req.query.api_key)) {
        res.status(403).json({
            title: "Access denied",
            message: "API key invalid!"
        })
        return;
    }
    try {
        const sports = await Sport.find();
        res.status(200).json(sports);
    } catch(err) {
        res.status(500).json({
            title: "internal error",
            message: err.message
        })
    }
})

fitmate_router.get('/find_sport/:sportName', async (req, res) => {
    if(!req.query.api_key) {
        res.status(403).json({
            title: "Access denied",
            message: "API key not provided!"
        })
        return;
    }
    if(!await check_key(req.query.api_key)) {
        res.status(403).json({
            title: "Access denied",
            message: "API key invalid!"
        })
        return;
    }
    try {
        const sports = await Sport.findOne( {'name': req.params.sportName} ) ;
        res.status(200).json(sports);
    } catch(err) {
        res.status(500).json({
            title: "internal error",
            message: err.message
        })
    }
})

fitmate_router.get('/authenticate_user/', async (req, res) => {
    if(!req.query.api_key) {
        res.status(403).json({
            title: "Access denied",
            message: "API key not provided!"
        })
        return;
    }
    if(!await check_key(req.query.api_key)) {
        res.status(403).json({
            title: "Access denied",
            message: "API key invalid!"
        })
        return;
    }
    if(req.query.login == null || req.query.password == null) {
        res.status(400).json({
            title: "Bad Request",
            message: "missing login or password!"
        })
    }
    try {
        if(await check_user_password(req.query.login, req.query.password) === 404) {
            res.status(404).json({
                title: "Requested resource not found!",
                message: "wrong login!"
            })
            return;
        }
        if (!await check_user_password(req.query.login, req.query.password)) {
            res.status(403).json({
                title: "Access Denied",
                message: "wrong login or password!"
            })
            return;
        }
        res.status(200).json({
            title: "Authentication complete",
            message: `Hello, ${req.query.login}!`
        });
    } catch(err) {
        res.status(500).json({
            title: "internal error",
            message: err.message
        })
    }
})

const get_date = () => {
    let yourDate = new Date()
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset*60*1000))
    return yourDate.toISOString().split('T')[0];
}

const check_key = async (v_api_key) => {
    try {
        let query = Developer_account.findOne({api_key: new mongoose.Types.ObjectId(v_api_key)});
        const dev = await query.exec();
        if(dev == null) {
            console.log("wrong api key!");
            return false;
        }
        let calls = dev.call_count.valueOf();
        query = Developer_account.findOneAndUpdate({api_key: v_api_key}, {call_count: calls + 1});
        await query.exec();
        return true;
    }catch(err) {
        return false;
    }
}

const check_email_availability = async (v_email) => {
    try {
        let query = User_account.findOne({email: v_email});
        const result = await query.exec();
        if(result == null) {
            console.log("email not taken!");
            return true;
        }
        return false;
    }catch(err) {
        return false;
    }
}

const check_login_availability = async (v_login) => {
    try {
        let query = User_account.findOne({login: v_login});
        const result = await query.exec();
        if(result == null) {
            console.log("login not taken!");
            return true;
        }
        return false;
    }catch(err) {
        return false;
    }
}

const check_user_password = async (v_user_login, v_password) => {
    try {
        let query = User_account.findOne({login: v_user_login});
        const result = await query.exec();
        if(result == null) {
            console.log("login not taken!");
            return 404;
        }
        let actual_password_hashed = result.password_hashed;
        const salt = result.password_salt;
        const hashed_password = await bcrypt.hash(v_password, salt);
        return hashed_password === actual_password_hashed;
    }catch(err) {
        return false;
    }
}

export default fitmate_router;