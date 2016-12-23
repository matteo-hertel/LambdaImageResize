var path = require('path');
var event;
function setEvent(e){
    event = e;
}
function getSourceBucket(){
    return event.Records[0].s3.bucket.name;

}
function getKey(){
    return decodeURIComponent(event.Records[0].s3.object.key.replace(
            /\+/g, " "));
}

function getDestinationBucket(){
    var sourceBucket = getSourceBucket();
    return sourceBucket.replace("source", "destination");
}

function getFileName(){
    var key = getKey();
    return path.basename(key);
}
module.exports = {
    setEvent : setEvent,
    getSourceBucket : getSourceBucket,
    getKey : getKey,
    getDestinationBucket : getDestinationBucket,
    getFileName : getFileName
};
