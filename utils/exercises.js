require('mongoose');
const User = require('../models/user');

const insertExercise = async (id, ...exerciseContent) => {
    try {
        // Insert the exercise into the logs...
        const user = await User.findById(id);
        user.log.push({
            description: exerciseContent[0],
            duration: exerciseContent[1],
            date: exerciseContent[2]
        });
        console.log('insertion done well');

        // Update exercise logs
        user.count++;
        user.save();

        return true
    } catch {
        console.log('insertion done wrong')
        return false
    }

}

module.exports = insertExercise;