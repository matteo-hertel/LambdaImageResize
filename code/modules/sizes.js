function getSizes(srcKey){
    var _800px = {
        width: 800,
        dstnKey: srcKey,
        destinationPath: "800"
    };
    var _500px = {
        width: 500,
        dstnKey: srcKey,
        destinationPath: "500"
    };
    var _200px = {
        width: 200,
        dstnKey: srcKey,
        destinationPath: "200"
    };
    var _180px = {
        width: 180,
        dstnKey: srcKey,
        destinationPath: "180"
    };
    var _45px = {
        width: 45,
        dstnKey: srcKey,
        destinationPath: "45"
    };
return [_800px, _500px, _200px, _180px, _45px];
}
module.exports = {getSizes : getSizes};
