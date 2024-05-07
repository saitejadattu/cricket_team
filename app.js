const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'cricketTeam.db')
const app = express()
app.use(express.json())

let db = null
const intializingDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
intializingDbAndServer()
const convertingIntoCamelCase = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

//GET player details
app.get('/players/', async (request, response) => {
  const getplayerQuery = `
      SELECT * FROM cricket_team;
  `
  const playerDetailsArray = await db.all(getplayerQuery)
  response.send(
    playerDetailsArray.map(eachPlayer => convertingIntoCamelCase(eachPlayer)),
  )
})

//POST player details
app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayerQuery = `
      INSERT INTO 
        cricket_team
        (
         player_name,
         jersey_number,
         role 
        )
      VALUES
        (
          "${playerName}",
          ${jerseyNumber},
          "${role}"
        );
  `
  await db.get(postPlayerQuery)
  response.send('Player Added to Team')
})

//GET Player details
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
      SELECT * FROM 
        cricket_team
      WHERE 
        player_id = ${playerId};
  `
  const playerArray = await db.get(getPlayerQuery)
  response.send(convertingIntoCamelCase(playerArray))
})

//PUT Player Details
app.put('/players/:playerId', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const putPlayerDetails = `
      UPDATE
        cricket_team
      SET
         player_name = "${playerName}",
         jersey_number = ${jerseyNumber},
         role = "${role}";
  `
  await db.run(putPlayerDetails)
  response.send('Player Details Updated')
})

//Deletes a player from the team (database) based on the player ID
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
      DELETE FROM cricket_team WHERE player_id = ${playerId};
  `
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
