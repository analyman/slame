/** bibliography generator
 * [authors, ...], title, publisher, year */

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

const biblio = (args, content) => {
    if (content.trim().length == 0)
        return '';
    let badbiblio = "bad bibliography";
    let ret = `
    <div class='bibliography'>
        <div class='bibliography-title'>Bibliography</div>
        <div class='bibliography-divide-line'></div>
    `;
    ret += "<div class='bibliography-list'>";
    let biblios = content.split('\n');
    let i = 1;
    for (let bib of biblios) {
        let vv = [];
        let x = '[' + good_the_string(bib) + ']';
        console.log(x);
        try {
            vv = eval(x);
        } catch (err) {
            console.log(err);
            throw badbiblio;
        }
        if (vv.length < 2 || vv.length > 4 ||
            (!Array.isArray(vv[0]) && typeof(vv[0]) != 'string') || 
            typeof(vv[1]) != 'string')
            throw badbiblio;
        ret += "<div class='bibliography-item'>";
        ret += `<span class='bibliography-order'>${i}</span>`;

        /** authors */
        ret += "<span class='authors'>";
        if (typeof(vv[0]) == 'string')
            vv[0] = [vv[0]];
        for (let author of vv[0]) {
            if (typeof(author) != 'string')
                throw badbiblio;
            ret += "<span class='author'>" + author + "</span>";
        }
        ret += "</span>";

        /** title */
        ret += "<span class='title'>" + vv[1] + "</span>";

        /** publisher */
        if (vv.length >= 3)
            ret += "<span class='publisher'>" + vv[2] + "</span>";

        /** year */
        if (vv.length >= 4)
            ret += "<span class='year'>" + vv[3] + "</span>";

        ret += "</div>";
    }
    ret += "</div></div>"
    return ret;
}

hexo.extend.tag.register('bibliography', biblio, {ends: true});

