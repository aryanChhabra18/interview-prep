const jwt = require("jsonwebtoken")
const  {JWT_USER_SECRET} = require("../config")

function userMiddleware(req,res,next){
    const token = req.headers.token
    const decodedInformation = jwt.verify(token,JWT_USER_SECRET)
    if(decodedInformation){
        req.userId = decodedInformation.id
        next()
    }
    else{
        res.status(403).json({
            message:"you are not signed in"
        })
    }
}

module.exports = {
    userMiddleware
}