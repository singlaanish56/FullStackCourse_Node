const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
mongoose.connect(url)
.then(result => {
    console.log("Connected to the DB")
})
.catch((err) => {
    console.log("Error Connecting to DB", err.message)
})

const phoneEntrySchema = new mongoose.Schema({
    name : {
      type: String,
      minLength: 3,
      required: true
    },
    number: {      
      type: String,
      minLength: 8,
      validate:{
        validator : function(v){
        return  /\d{2,3}-\d{3}/.test(v);
      },
      message: props => `${props.value} is not a Valid Phone Number`
    },
      required: true
    }
})

phoneEntrySchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

module.exports =  mongoose.model('PhoneEntry', phoneEntrySchema)