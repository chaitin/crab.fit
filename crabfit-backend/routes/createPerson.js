import dayjs from 'dayjs'
import bcrypt from 'bcrypt'
import * as db from '../db'

const createPerson = async (req, res) => {
  const { eventId } = req.params
  const { person } = req.body

  try {
    const event = (await db.EventModel.find({
      key: eventId
    }))[0]

    const personResult = (await db.PersonModel.find({
      eventId,
      name: person.name
    }))[0]

    if (event) {
      if (person && personResult === undefined) {
        const currentTime = dayjs().format()

        // If password
        let hash = null
        if (person.password) {
          hash = await bcrypt.hash(person.password, 10)
        }

        const entity = {
          name: person.name.trim(),
          password: hash,
          eventId: eventId,
          created: currentTime,
          availability: [],
        }

        await new db.PersonModel(entity).save()

        res.status(201).send({ success: 'Created' })

        // Update stats
        const statsCountResult = (await db.StatsModel.find())[0] || null
        if (statsCountResult) {
          const defaultCount = {
            personCount: 1
          }
          const opra = statsCountResult?.personCount >= 0 ? {
            $inc: defaultCount
          } : {
            $set: defaultCount
          }
          await db.StatsModel.findByIdAndUpdate({
            _id: statsCountResult._id
          }, opra)
        } else {
          await new db.StatsModel({
            eventCount: 0,
            personCount: 1,
          }).save()
        }
      } else {
        res.status(400).send({ error: 'Unable to create person' })
      }
    } else {
      res.status(404).send({ error: 'Event does not exist' })
    }
  } catch (e) {
    console.error(e)
    res.status(400).send({ error: 'An error occurred while creating the person' })
  }
}

export default createPerson
