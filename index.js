require('dotenv').config()
const express = require('express')
// const mongoose = require('mongoose')
const app = express()
const Person = require('./models/person')

const morgan = require('morgan')
app.use(express.static('dist'))

app.use(express.json())
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)

    console.log('Params:  ', request.params)

    console.log('---')
    next()
}
app.use(requestLogger)

const cors = require('cors')
const person = require('./models/person')
app.use(cors())
// app.use(morgan('tiny'))
morgan.token('body', function (req) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response, next) => {
    person.countDocuments({}, { hint: '_id_' }).then(result => {
        const currDate = new Date().toString()
        response.send(
            '<p>Phonebook has info for ' + result + ' people</p><br/> <p>' + currDate + '</p>')
    }).catch(error => next(error))

})

app.get('/api/persons/:id', (request, response, next) => { //next on Expressin juttu!!!
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.json(result)
    }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    // if (!body.name || !body.number) {
    //     return response.status(400).json({
    //         error: 'Content missing'
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
    ).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        }).catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

// tämä tulee kaikkien muiden middlewarejen ja routejen rekisteröinnin jälkeen!
app.use(errorHandler)

