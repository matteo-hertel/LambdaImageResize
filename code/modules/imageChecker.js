var path = require('path');
var allowedExtenstions = ["jpg", "gif", "png" ,"eps"];

function checkImage(img){
    // Infer the image type.
    var typeMatch = img.match(/\.([^.]*)$/);
    var fileName = path.basename(img);
    if (!typeMatch) {
        return false;
    }
    //stop the process if the image extension is not allowed
    var imageType = typeMatch[1].toLowerCase();
    
    if (allowedExtenstions.indexOf(imageType) === -1) {
        return false;
    }
    return true;
}

module.exports = checkImage;
