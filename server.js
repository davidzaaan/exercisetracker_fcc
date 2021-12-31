const express = require('express')
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user');
const exercises = require('./utils/exercises');
const utils = require('./utils/utils');
const cors = require('cors');
const port = process.env.PORT || 3000;
require('dotenv').config()

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// USER CREATION ROUTE
app.route('/api/users')
  .get(async (req, res) => {

    try {

      const users = await User.find({}).select(['_id', 'username']);
      console.log(users)
      res.json(users)

    } catch {
      res.json({
        error: 'no users registered'
      })
    }


  })
  .post(async (req, res) => {

    try {

      const newUser = new User({
        username: req.body.username
      });

      await newUser.save();
      return res.json({
        username: newUser.username,
        _id: newUser._id
      })

    } catch (err) {
      return res.json({ error: 'username already exists' })
    }
  });

// USER EXERCISES INSERTION
app.post('/api/users/:id/exercises', async (req, res) => {
  try {
    // Getting data from the form
    const id = req.body.id;
    const description = req.body.description;
    const duration = parseInt(req.body.duration);
    let date = new Date(req.body.date).toDateString();

    if (date == 'Invalid Date') {
      date = new Date().toDateString();
    }

    if (!duration) {
      throw new Error('invalid duration')
    }

    // Inserting data to user...
    if (exercises(id, description, duration, date)) {

      const user = await User.findById(id);

      return res.json({
        _id: user._id,
        username: user.username,
        date,
        duration,
        description
      })

    } else {

      throw new Error('insertion failed');

    }

  } catch (error) {
    console.log('query went wrong')
    return res.json({ error: error.message })
  }

});


// USER EXERCISES LOGS
app.get('/api/users/:id/logs', async (req, res) => {

  // Retrieving logs from user
  try {

    const user = await User.findById(req.params.id);

    // if the query string object is not empty
    if (Object.keys(req.query).length !== 0) {
      console.log(req.query)

      let limit = Number(req.query.limit)

      if (!limit) {
        limit = -1
      }

      // if from and to parameters exist in the query string
      if (req.query.from && req.query.to) {

        const from = new Date(req.query.from).toDateString(); // make a new Date object
        const to = new Date(req.query.to).toDateString(); // make a new Date object
        const logs = utils.completeLog(user, from, to); // retrieving the array with the date limit

        return res.json({
          _id: user._id,
          username: user.username,
          from,
          to,
          count: logs.slice(0, limit).length,
          log: logs.slice(0, limit)
        })

      } else {

        // if only the from parameter exists
        if (req.query.from) {

          const from = new Date(req.query.from).toDateString(); // make a new Date object
          const logs = utils.from(user, from); // retrieving the array with the date limit

          return res.json({
            _id: user._id,
            username: user.username,
            from,
            count: logs.slice(0, limit).length,
            log: logs.slice(0, limit)
          })

        } else {

          // if only the to parameter exists
          if (req.query.to) {
            const to = new Date(req.query.to).toDateString(); // make a new Date object
            const logs = utils.to(user, to); // retrieving the array with the date limit

            return res.json({
              _id: user._id,
              username: user.username,
              to: to,
              count: logs.slice(0, limit).length,
              log: logs.slice(0, limit)
            })

          }

        }

      }

      // if neither from nor to exists but limit does, send json with the limit
      return res.json({
        _id: user._id,
        username: user.username,
        count: user.log.slice(0, limit).length,
        log: user.log.slice(0, limit)
      })

    } else {
      // if no query string parameters passed, send the user object
      res.json({
        _id: user._id,
        username: user.username,
        count: user.count,
        log: user.log
      })
    }



  } catch (err) {
    res.json({
      error: err.message
    });
  }


})


app.listen(port, () => {
  console.log('Your app is listening on port ' + port)
})
