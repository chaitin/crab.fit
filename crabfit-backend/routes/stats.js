import packageJson from '../package.json'
import * as db from '../db'

const stats = async (req, res) => {
  let eventCount = null
  let personCount = null

  try {
    const statsResult = (await db.StatsModel.find())[0] || null

    eventCount = statsResult?.eventCount || 0
    personCount = statsResult?.personCount || 0

  } catch (e) {
    console.error(e)
  }

  res.send({
    eventCount,
    personCount,
    version: packageJson.version,
  })
}

export default stats
