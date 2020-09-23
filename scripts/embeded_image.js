/** embeded images
 * link, alt, description */
const utils = require('./utils');

const SlameImageState = {order: 0};

const embed_image = (args, content) => {
    if (content.trim().length == 0)
        return '';
    let image_error = "bad embeded image script";
    let ret = `<div class='slame-images'>`;
    let images = content.split('\n');
    for (let image of images) {
        image = image.trim();
        if(image.length == 0 || image[0] == '#') continue;

        SlameImageState.order++;
        let vv = [];
        let x = '[' + utils.goodString(image) + ']';
        try {
            vv = eval(x);
        } catch (err) {
            console.log(err);
            throw image_error;
        }
        if (vv.length < 2 || vv.length > 3 ||
            typeof(vv[0]) != 'string' || 
            typeof(vv[1]) != 'string')
            throw image_error;
        ret += "<div class='slame-image'>";
        ret += 
        `<div class='slame-image-slot'>
           <img src='${vv[0]}' alt='${vv[1]}'/>
         </div>
         <div class='slame-image-description'>
           <span class='slame-image-figure-number'>Figure ${SlameImageState.order}</span>
           <span class='slame-image-description-content'>${vv[2] ? ". " + vv[2] : ""}</span>
         </div>
        `;
        ret += "</div>";
    }
    ret += "</div>";
    return ret;
}

hexo.extend.tag.register('slameImage', embed_image, {ends: true});

