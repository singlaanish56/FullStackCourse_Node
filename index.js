require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const PhoneEntry = require('./models/phoneentry')

morgan.token('content', function getId (req) {
  return JSON.stringify(req.body)
})

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

//same as - morgan(':method :url :status :res[content-length] - :response-time ms')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

app.get('/',(req, res) => {
  res.send('<h1>Welcome to the notes app</h1>')
})

app.get('/api/persons',(req, res) => {
  PhoneEntry.find({}).then(entry => {
    res.json(entry)
  })
})

app.get('/info', async (req,res) => {

  let len = await PhoneEntry.countDocuments({})
  let s = `Phonebook has info for ${len} people`
  let date = new Date()
  let responseString = `<div><p>${s}</p><p>${date}</p></div>`

  res.send(responseString)
})

app.delete('/api/persons/:id', (req, res, next) => {
  let id = req.params.id
  PhoneEntry.findByIdAndRemove(id).then((error, deletedRecord) =>
  {
    if(!error)
    {
      console.log(deletedRecord)
      res.status(204).end()
    }else{
      next(error)
    }

  }).catch(error =>  next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  let id = req.params.id
  PhoneEntry.findById(id).then(entry =>
  {
    if(entry)
    {
      res.json(entry)
    }else{
      res.status(404).end()
    }

  }).catch(error =>  next(error))
})

app.post('/api/persons',(req, res, next) => {
  const body = req.body
  if(!body.name || !body.number)
  {
    return res.status(400).json({
      error:'content missing'
    })
  }

  PhoneEntry.find({ 'name':body.name }).then(() => {
    next()
  })

  const entry = new PhoneEntry({
    name : body.name,
    number : body.number,
  })

  entry.save().then(savedentry => {
    res.json(savedentry)
  }).catch(error => next(error))
})

app.put('/api/persons/:id',(req, res, next) => {
  console.log('already exists')

  const body = req.body
  const updatedPerson = {
    id:req.params.id,
    name : body.name,
    number: body.number
  }

  PhoneEntry.findByIdAndUpdate(req.params.id, updatedPerson, { new:true, runValidators: true, context:'query' })
    .then(updatedEntry => {
      res.json(updatedEntry)
    }).catch(error => next(error))
})

const unknownEndPoint = (req, res) => {
  res.status(404).send({ error:'Unknown Endpoint.' })
}

app.use(unknownEndPoint)

const errorHandler = (error, req, res, next) => {
  console.log(error.message)
  if(error.name === 'CastError'){
    return res.status(400).send({ error:'Malinformed id.' })
  }else if(error.name === 'ValidationError'){
    return res.status(400).send({ error : error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
