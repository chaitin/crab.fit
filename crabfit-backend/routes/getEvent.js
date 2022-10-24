import dayjs from 'dayjs'
import * as db from '../db'

const getEvent = async (req, res) => {
  const { eventId } = req.params

  try {
    const event = (await db.EventModel.find({
      key: eventId
    }).lean())[0]

    if (event) {
      res.send({
        id: eventId,
        ...event,
      })

      // Update last visited time
      await db.EventModel.findOneAndUpdate({
        eventId
      }, {
        $set: {
          visited: dayjs().format()
        }
      })
    } else {
      res.status(404).send({ error: 'Event not found' })
    }
  } catch (e) {
    console.error(e)
    res.status(404).send({ error: 'Event not found' })
  }
}

export default getEvent
