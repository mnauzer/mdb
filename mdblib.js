// padding number
const pad = (number, length) => {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
};
