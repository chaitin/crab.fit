import dayjs from 'dayjs'
import * as db from '../db'

const taskRemoveOrphans = async (req, res) => {
  if (req.header('X-Appengine-Cron') === undefined) {
    return res.status(400).send({ error: 'This task can only be run from a cron job' })
  }

  const threeMonthsAgo = dayjs().subtract(3, 'month').format()

  console.log(`Running orphan removal task at ${dayjs().format('h:mma D MMM YYYY')}`)

  try {
    // Fetch people that are older than 3 months
    const oldPeople = (await db.PersonModel.find({
      created: {
        $gt: threeMonthsAgo
      }
    }))

    if (oldPeople && oldPeople.length > 0) {
      console.log(`Found ${oldPeople.length} people older than 3 months, checking for events`)

      // Fetch events linked to the people discovered
      let peopleWithoutEvents = 0
      await Promise.all(oldPeople.map(async person => {
        const event = await db.EventModel.find({
          key: person.eventId
        })

        if (!event) {
          peopleWithoutEvents++
          await db.PersonModel.deleteMany({
            created: {
              $gt: threeMonthsAgo
            }
          })
        }
      }))

      if (peopleWithoutEvents > 0) {
        console.log(`Orphan removal successful: ${peopleWithoutEvents} people removed`)
        res.sendStatus(200)
      } else {
        console.log('Found 0 people without events, ending orphan removal')
        res.sendStatus(404)
      }
    } else {
      console.log('Found 0 people older than 3 months, ending orphan removal')
      res.sendStatus(404)
    }
  } catch (e) {
    console.error(e)
    res.sendStatus(404)
  }
}

export default taskRemoveOrphans
