require('mongoose');

const from = (user, date) => {
    const from = new Date(date).getTime()
    user.log = user.log.filter((exercise) => {
        if (new Date(exercise['date']).getTime() >= from) {
            return true
        }
    })
    return user.log
}

const to = (user, date) => {
    const to = new Date(date).getTime()
    user.log = user.log.filter((exercise) => {
        if (new Date(exercise['date']).getTime() <= to) {
            return true
        }
    })
    return user.log
}

const isDate = (date) => {
    const dateToVerify = new Date(date);
    return dateToVerify == 'Invalid Date' ? false : dateToVerify
}

const completeLog = (user, fromTo, toWhen) => {
    const from = new Date(fromTo).getTime()
    const to = new Date(toWhen).getTime()
    console.log(from, to)
    user.log = user.log.filter((exercise) => {
        if (new Date(exercise['date']).getTime() <= to &&
            new Date(exercise['date']).getTime() >= from) {
            return true
        }
    })
    return user.log
}



module.exports = {
    isDate: isDate,
    from: from,
    to: to,
    completeLog: completeLog
}