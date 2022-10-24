import dayjs from 'dayjs'
import punycode from 'punycode/'

import adjectives from '../res/adjectives.json'
import crabs from '../res/crabs.json'

import * as db from '../db'

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1)

// Generate a random name based on an adjective and a crab species
const generateName = () =>
  `${capitalize(adjectives[Math.floor(Math.random() * adjectives.length)])} ${crabs[Math.floor(Math.random() * crabs.length)]} Crab`

// Generate a slug for the crab fit
const generateId = name => {
  let id = punycode.encode(name.trim().toLowerCase()).trim().replace(/[^A-Za-z0-9 ]/g, '').replace(/\s+/g, '-')
  if (id.replace(/-/g, '') === '') {
    id = generateName().trim().toLowerCase().replace(/[^A-Za-z0-9 ]/g, '').replace(/\s+/g, '-')
  }
  const number = Math.floor(100000 + Math.random() * 900000)
  return `${id}-${number}`
}

const createEvent = async (req, res) => {
  const { event } = req.body

  try {
    const name = event.name.trim() === '' ? generateName() : event.name.trim()
    let eventId = generateId(name)
    const currentTime = dayjs().format()

    // Check if the event ID already exists, and if so generate a new one
    let eventResult
    do {
      eventResult = (await db.EventModel.find({
        key: eventId
      }))[0]

      if (eventResult !== undefined) {
        eventId = generateId(name)
      }
    } while (eventResult !== undefined)

    const entity = {
      key: eventId,
      name: name,
      created: currentTime,
      times: event.times,
      timezone: event.timezone,
    }

    new db.EventModel(entity).save(() => {
      res.status(201).send({
        id: eventId,
        name: name,
        created: currentTime,
        times: event.times,
        timezone: event.timezone,
      })
    })

    // Update stats
    const statsCountResult = (await db.StatsModel.find())[0] || null
    if (statsCountResult) {
      const defaultCount = {
        eventCount: 1
      }
      const opra = statsCountResult?.eventCount >= 0 ? {
        $inc: defaultCount
      } : {
        $set: defaultCount
      }
      await db.StatsModel.findByIdAndUpdate({
        _id: statsCountResult._id
      }, opra)
    } else {
      await new db.StatsModel({
        eventCount: 1,
        personCount: 0,
      }).save()
    }
  } catch (e) {
    console.error(e)
    res.status(400).send({ error: 'An error occurred while creating the event' })
  }
}

export default createEvent
