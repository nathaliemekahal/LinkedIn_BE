const { Schema, model } = require("mongoose")
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

const ProfilesModel = model("Profiles", ProfilesSchema)
module.exports = ProfilesModel