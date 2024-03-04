const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const path = require('path')
const jwt = require('jsonwebtoken')
const datapath = path.join(__dirname, 'twitterClone.db')
let db = null
app.use(express.json())
const initialization = async () => {
  try {
    db = await open({filename: datapath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('success')
    })
  } catch (e) {
    console.log(`${e.message}`)
    process.exit(1)
  }
}
initialization()
/*const balu = (request, response, next) => {
  const {tweet} = request.body
  const {tweetId} = request.params
  let jwt_token = ''
  const authHeader = request.headers['authorization']
  if (authHeader === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    const p = authHeader.split(' ')

    jwt_token = p[1]
    if (jwt_token === undefined) {
      response.status(401)
      response.send('Invalid JWT Token')
    } else {
      jwt.verify(jwt_token, 'balu', async (error, payload) => {
        if (error) {
        */

app.post('/register/', async (request, response) => {
  const {username, password, name, gender} = request.body
  const c = `SELECT *
             FROM user
             WHERE username="${username}";`
  const y = await db.get(c)
  if (y !== undefined) {
    response.status(400)
    response.send('User already exists')
  } else {
    if (password.length < 6) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const k = await bcrypt.hash(password, 10)
      const d = `INSERT INTO user
                     (username,password,name,gender)
                     VALUES ("${username}","${k}","${name}","${gender}")`
      const e = await db.run(d)
      response.status('200')
      response.send('User created successfully')
    }
  }
})
app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const d = `SELECT *
          FROM user
          WHERE username="${username}";`
  const y = await db.get(d)
  if (y === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const x = await bcrypt.compare(password, y.password)
    if (x === false) {
      response.status(400)
      response.send('Invalid password')
    } else {
      const payload = {username: username}
      const jwtToken = jwt.sign(payload, 'balu')
      response.send({jwtToken})
    }
  }
})
const balu = (request, response, next) => {
  const {tweet} = request.body
  const {tweetId} = request.params
  let jwt_token = ''
  const authHeader = request.headers['authorization']
  if (authHeader === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    const p = authHeader.split(' ')

    jwt_token = p[1]
    if (jwt_token === undefined) {
      response.status(401)
      response.send('Invalid JWT Token')
    } else {
      jwt.verify(jwt_token, 'balu', async (error, payload) => {
        if (error) {
          response.status(401)
          response.send('Invalid JWT Token')
        } else {
          request.payload = payload
          request.tweetId = tweetId
          request.tweet = tweet
          next()
        }
      })
    }
  }
}

app.get('/user/tweets/feed', balu, async (request, response) => {
  const {payload} = request
  const {user_id, name, username, gender} = payload
  console.log(name)
  const u = `SELECT username,tweet,date_time AS dateTime
  FROM follower INNER JOIN tweet ON follower.following_user_id=tweet.user_id INNER JOIN ON user.user_id=follower.following_user_id
  WHERE follower.follower_user_id=${user_id}
  ORDER BY 
      date_time DESC
  LIMIT 4;`
  const c = await db.all(u)
  response.send(c)
})
app.get('/user/following', balu, async (request, response) => {
  const {payload} = request
  const {user_id, name, username, gender} = payload
  console.log(user_id)
  const t = `SELECT user.name
           FROM user INNER JOIN follower ON user.user_id=follower.following_user_id
           WHERE follower.follower_user_id=${user_id};`
  const h = await db.all(t)
  response.send(h)
})

module.exports = app
