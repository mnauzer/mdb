// padding number
const pad = ((number, length) => {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
});

const roundTimeQ = (time => {
    var timeToReturn = new Date(time);

    timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
    timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
    timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15);
    return timeToReturn;

});

const remoteMessage = (
    (mes) => {
        message("Remote script: " + mes);
    });

