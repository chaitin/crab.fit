import bcrypt from 'bcrypt'
import * as db from '../db'

const updatePerson = async (req, res) => {
  const { eventId, personName } = req.params
  const { person } = req.body

  try {
    const personResult = (await db.PersonModel.find({ eventId, name: personName }))[0]

    if (personResult) {
      if (person && person.availability) {
        if (personResult.password) {
          const passwordsMatch = person.password && await bcrypt.compare(person.password, personResult.password)
          if (!passwordsMatch) {
            return res.status(401).send({ error: 'Incorrect password' })
          }
        }

        await db.PersonModel.findOneAndUpdate({
          eventId,
          name: personName
        }, {
          $set: {
            availability: person.availability
          }
        })

        res.status(200).send({ success: 'Updated' })
      } else {
        res.status(400).send({ error: 'Availability must be set' })
      }
    } else {
      res.status(404).send({ error: 'Person not found' })
    }
  } catch (e) {
    console.error(e)
    res.status(400).send('An error occurred')
  }
}

export default updatePerson
