const mongoose = require('mongoose')

let mongo_url = ''
if (process.env.MONGO_URL === undefined) {
  mongo_url = 'mongodb://127.0.0.1:27017'
} else {
  mongo_url = process.env.MONGO_URL
}

mongoose.connect(mongo_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => {
  console.log(err)
})

mongoose.connection.on('connected', () => console.log('mongodb connected'))

mongoose.connection.on('error', err => console.log('connect error', err))

/** event model */
const eventSchema = mongoose.Schema({
  key: String,
  name: String,
  created: Date,
  times: Array,
  timezone: String,
  visited: Date,
}, {
  collection: 'event',
})
const EventModel = mongoose.model('event', eventSchema)
exports.EventModel = EventModel

/** stats model */
const statsSchema = mongoose.Schema({
  eventCount: Number,
  personCount: Number
}, {
  collection: 'stats'
})
const StatsModel = mongoose.model('stats', statsSchema)
exports.StatsModel = StatsModel

/** person model */
const personSchema = mongoose.Schema({
  eventId: String,
  name: String,
  password: String,
  availability: Array,
  created: Date,
}, {
  collection: 'person'
})
const PersonModel = mongoose.model('person', personSchema)
exports.PersonModel = PersonModel