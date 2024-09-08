const express= require('express');
const { authMiddleware } = require('../middleware/middleware');
const zod = require("zod");
const { Account } = require('../db');
const { default: mongoose } = require('mongoose');

const router= express.Router()

router.get("/balance",authMiddleware,async(req,res)=>{
    const userId= req.userId;
    const account= await Account.findOne({userId});
    return res.json({balance:account.balance});
})

// create a validation for amount to enter

const transferValidation = zod.object({
    amount:zod.number().positive()
})
router.post("/transfer",authMiddleware,async(req,res)=>{

    // const {success} = transferValidation.safeParse(req.body.amount);
    // if(!success)
    //     return res.status(411).json({
    //         "message":"Invalid Amount"
    //     })
    const transSession = await mongoose.startSession();

    transSession.startTransaction();

    const {amount, to, userId}= req.body;

    // fetch the balance
    const account= await Account.findOne({userId}).session(transSession);

    if(account.balance < amount){
        await transSession.abortTransaction();
        return res.status(400).json({
            "message":"Insufficient funds"
        })
    }

    const toAccount = await Account.findOne({userId:to}).session(transSession);

    if(!toAccount){
        await transSession.abortTransaction();
        return res.status(400).json({
            "message":"Invalid Account Details"
        })
    }

    // perform the transfer
    await Account.updateOne({userId},{$inc:{balance:-amount}}).session(transSession);

    await Account.updateOne({userId:to},{$inc:{balance:amount}}).session(transSession);

    // commit transaction finally
    await transSession.commitTransaction();

    return res.json({
        "message":"Transfer Successful"
    })





})

module.exports=router;
