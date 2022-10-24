import bcrypt from 'bcrypt'
import * as db from '../db'

const login = async (req, res) => {
  const { eventId, personName } = req.params
  const { person } = req.body

  try {
    const personResult = (await db.PersonModel.find({
      eventId,
      name: personName
    }).lean())[0]

    if (personResult) {
      if (personResult.password) {
        const passwordsMatch = person && person.password && await bcrypt.compare(person.password, personResult.password)
        if (!passwordsMatch) {
          return res.status(401).send({ error: 'Incorrect password' })
        }
      }

      res.send({
        name: personName,
        availability: personResult.availability,
        created: personResult.created,
      })
    } else {
      res.status(404).send({ error: 'Person does not exist' })
    }
  } catch (e) {
    console.error(e)
    res.status(400).send({ error: 'An error occurred' })
  }
}

export default login
