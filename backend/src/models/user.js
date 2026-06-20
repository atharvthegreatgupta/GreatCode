const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ // sir ka =>  = new Schema({}) tha ... gpt said both are the same thing


    firstName : {

        type : String,
        required : true,
        minLength : 3,
        maxLength : 20

    },

    lastName : {
        type : String,
        minLength : 3,
        maxLength : 20
    },

    emailId : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        immutable : true // once the data is saved in the DB, email can never be changed
    },

    age : {

        type : Number,
        min : 6,
        max : 80

    },

    role : {
        type : String,
        enum : ["user" , "admin"],
        default : "user"
    },

    problemSolved : {

        type:[{
            
            type : mongoose.Schema.Types.ObjectId,
            ref:'problem',
            
        }],

        unique : true

        
    },

    password : {

        type : String,
        
        required : true
    }
},{
    timestamps : true
});

userSchema.post( 'findOneAndDelete' , async function (userInfo) { // works after 'findByIdAndDelete'

    if(userInfo){
        await mongoose.model('submission').deleteMany( {userId : userInfo._id} );
    }
} )

const User = mongoose.model( "user" , userSchema );

module.exports = User;