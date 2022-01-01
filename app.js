const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
// mongoose.connect(process.env.MONGODB_URI);
mongoose.connect('mongodb://localhost/21017')
const { Schema } = mongoose;

const ExerciseSchema = new mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: Date,
    user_id: String
});

const UserSchema = new mongoose.Schema({
    username: String
})

const Exercise = mongoose.model('Exercise', ExerciseSchema);
const User = mongoose.model('User', UserSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users')
    .get(async (req, res) => {
        const users = await User.find();
        res.send(users);
    })
    .post(async (req, res) => {
        const newUser = new User({ username: req.body.username })

        try {
            await newUser.save()
        } catch (err) {
            res.json({ error: err.message })
        }

        res.send(newUser)
    });

app.post('/api/users/:_id/exercises', async (req, res) => {
    const { _id, description, duration } = req.body;
    let user = undefined;
    try {
        user = await User.findById(_id).exec();
    } catch (err) {
        res.send('could not find user');
    }

    if (req.body.date.length === 0) {
        const date = new Date();
        const newExercise = new Exercise({
            username: user.username,
            description,
            duration,
            date,
            user_id: user._id
        });

        newExercise.save().then((exercise) => {
            const userObj = {
                _id: user._id,
                username: user.username,
                date: exercise.date.toDateString(),
                duration: exercise.duration,
                description: exercise.description
            }

            res.send(userObj);
        }).catch((error) => {
            throw new Error('something went wrong');
        });

    } else {
        try {
            const date = new Date(req.body.date);
            if (date == 'Invalid Date') throw new Error('Invalid date format');

            const newExercise = new Exercise({
                username: user.username,
                description,
                duration,
                date,
                user_id: user._id
            });

            newExercise.save().then((exercise) => {
                const userObj = {
                    _id: user._id,
                    username: user.username,
                    date: exercise.date.toDateString(),
                    duration: exercise.duration,
                    description: exercise.description
                }

                res.send(userObj);

            }).catch((error) => {
                throw new Error('something went wrong');
            });

        } catch (err) {
            res.json({
                error: err.message
            })
        }


    }

});


app.get('/api/users/:_id/logs', async (req, res) => {
    // TODO
    const id = req.params._id;
    const user = await User.findById(id).exec();
    const logs = await Exercise.find({ user_id: user._id }, '-_id -username -user_id -__v').exec();
    const finalLogs = logs.map((exercise) => {
        return ({
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString()
        })
    });
    const Log = {
        _id: user._id,
        username: user.username,
        count: logs.length,
        log: finalLogs
    }



    if (Object.keys(req.query).length !== 0) {

        const from = new Date(req.query.from);
        const to = new Date(req.query.to);
        let limit = parseInt(req.query.limit);
        if (!limit) {
            limit = -1;
        }

        const userLogs = Log.log.filter((exercise) => {
            let date = new Date(exercise.date).getTime();
            if (date >= from.getTime() && date <= to.getTime()) {
                return true;
            }
        })

        Log.from = from.toDateString();
        Log.to = to.toDateString();
        Log.count = userLogs.slice(0, limit).length;
        Log.log = userLogs.slice(0, limit);
        res.send(Log);


    } else {
        return res.send(Log);
    }



})


app.listen(port, () => {
    console.log("App listening on port " + port)
})
