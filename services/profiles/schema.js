/*
id server generated
name -> type string, min char 2, required
surname -> type string, min char 2, required
email -> type email, min char 5, required
bio -> not required
area -> required
image (server generated)
username -> required
createdAt server generated
updatedAt server generated
*/

const { Schema } = require("mongoose")
const mongoose = require("mongoose")
const v = require("validator")

const ProfilesSchema = new Schema (
    {
        name: {
            type: String,
            required: true,
        },
        surname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            validate: async (value) => {
                if(!v.isEmail(value)) {
                    throw new Error ("Email is not valid!")
                }else{
                    const checkEmail = await ProfilesModel.findOne({email: value})
                    if(checkEmail){
                        throw new Error ("Email already exists!")
                    }
                }
            },
        },
        bio: {
            type: String,
        },
        area: {
            type: String,
            require: true,
        },
        image: {
            data: Buffer,
            contentType: String,
        },
        username: {
            type: String,
            required: true,
        }
    }
    ,
    {timestamps: true}
)

const ProfilesModel = mongoose.model("Profiles", ProfilesSchema)
module.exports = ProfilesModel