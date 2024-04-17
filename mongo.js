const mongoose = require('mongoose')


// // print process.argv
// argv.forEach((val, index) => {
//     console.log(`${index}: ${val}`);
// });

// Launching the Node.js process as:

// node process - args.js one two = three four

if (process.argv.length < 3) {
    console.log('give at least password as argument')
    process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]
const url =
    `mongodb+srv://StinaSoile:${password}@fullstack-course-cluste.ixcnawg.mongodb.net/personApp?retryWrites=true&w=majority&appName=fullstack-course-cluster1`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (!name) {
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
}
if (name && !number) {
    console.log('give name and number')

}

if (number) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })

    person.save().then(result => {
        console.log('person saved!')
        mongoose.connection.close()
    })
}


