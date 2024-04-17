require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const Person = require('./models/person')

const morgan = require('morgan')
app.use(express.json())

app.use(express.static('dist'))
const cors = require('cors')
app.use(cors())
// app.use(morgan('tiny'))
morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)

    console.log('Params:  ', request.params)

    console.log('---')
    next()
}
app.use(requestLogger)

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": "1"
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5555",
        "id": "2"
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": "3"
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": "4"
    },
    {
        "name": "Stina Palomäki",
        "number": "33277dr",
        "id": "5fbc"
    }
]


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {

    const currDate = new Date().toString()
    response.send(
        '<p>Phonebook has info for ' + persons.length + ' people</p><br/> <p>' + currDate + '</p>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = (request.params.id)
    const person = persons.find(person => person.id === id)
    if
        (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = (request.params.id)
    const personToRemove = persons.find(person => person.id === id)
    persons = persons.filter(person => person.id !== id)
    // return response.status(200).json(personToRemove)
    if (!personToRemove) {
        return response.status(400).json({
            error: 'Content missing'
        })
    }
    response.json(personToRemove)
})

app.post('/api/persons', (request, response) => {
    // const idMath = Math.floor(Math.random() * 1000)
    // const id = idMath.toString()
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'Content missing'
        })
    }

    // if (persons.find((per) => per.name == person.name)) {
    //     return response.status(400).json({
    //         error: 'Name already exists'
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(
        savedPerson => {
            response.json(savedPerson)
        }
    )
    // person.id = id
    // persons = persons.concat(person)
    // response.json(person)
})

// alkup. versio ennen PaaS-hommia
// const PORT = 3001
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`)
// })

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)
