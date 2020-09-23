
function good_the_string(str) {
    let k = "";
    str = str.trim();
    str = str.replace(/"/g, '\\"');
    str = str.replace(/^([^[{])/g, '"$1');
    str = str.replace(/([^\]}])$/g, '$1"');

    str = str.replace(/([[{]) */g, '$1');
    str = str.replace(/ *([\]}])/g, '$1');

    str = str.replace(/([[{])([^[{])/g, '$1"$2');
    str = str.replace(/([^\]}])([\]}])/g, '$1"$2');
    str = str.replace(/ *, */g, ',');
    str = str.replace(/,([^[{])/g, ',"$1');
    str = str.replace(/([^\]}]),/g, '$1",');
    return str;
}

module.exports = {
    goodString: good_the_string
}

