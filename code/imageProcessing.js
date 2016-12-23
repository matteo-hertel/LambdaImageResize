// dependencies
var async = require('async');
var AWS = require('aws-sdk');
var gm = require('gm').subClass({
    imageMagick: true
});
var sizes = require('./modules/sizes');
var s3Utils = require('./modules/s3Utils');
var checkImage = require('./modules/imageChecker');
var util = require('util');
// get reference to S3 client
//AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();

exports.handler = function(event, context) {
    console.log(util.inspect(event, {
        depth: 15
    }));
    s3Utils.setEvent(event);
    var srcBucket = s3Utils.getSourceBucket();
    // Object key may have spaces or unicode non-ASCII characters.
    var srcKey = s3Utils.getKey();
    var dstBucket = s3Utils.getDestinationBucket();
    var fileName = s3Utils.getFileName();

    var _sizesArray = sizes.getSizes(srcKey);

    if (!checkImage(srcKey)) {
        context.fail("Image extension not allowed");
        return;
    }
    // Transform, and upload to same S3 bucket but to a different S3 bucket.
    async.forEachOf(_sizesArray, function(value, key, callback) {
        async.waterfall([
            function download(next) {
                console.log("downloading");
                // Download the image from S3 into a buffer.
                // sadly it downloads the image several times, but we couldn't place it outside
                // the variable was not recognized
                s3.getObject({
                    Bucket: srcBucket,
                    Key: srcKey
                }, next);
            },
            function convert(response, next) {
                console.log("converting");
                gm(response.Body)
                .antialias(true)
                .density(300)
                .toBuffer('png', function(err,
                    buffer) {
                    if (err) {
                        next(err);
                    } else {
                        next(null, buffer);
                    }
                });
            },
            function size(response, next) {
                console.log("getting sizes");
                // Transform the image buffer in memory.
                gm(response)
                .size(function(err, size) {
                    // Infer the scaling factor to avoid stretching the image unnaturally.
                    var scalingFactor = Math.min(
                        _sizesArray[key].width /
                        size.width, _sizesArray[
                            key].width / size.height
                    );

                    var width = scalingFactor *
                        size.width;
                    var height = scalingFactor *
                        size.height;

                    var index = key;
                    next(null, response, width, height, key);
                });
            },

            function process(response, width, height, key, next) {
                console.log("resizing and padding");
                var dimension = Math.max(width, height);
                gm(response)
                .antialias(true)
                .density(300)
                .gravity("Center")
                .strip()
                .resize(width, height)
                .extent(dimension, dimension, '!')
                .toBuffer(
                    'png',
                    function(err,
                        buffer) {
                        if (err) {
                            next(err);
                        } else {
                            next(null,
                                buffer,
                                dimension,
                                key);
                        }
                    });
            },
            function addPadding(response, dimension, key, next) {
                console.log("resizing and padding");
                var dimensionWithGutter = dimension + 20;
                gm(response)
                .antialias(true)
                .density(300)
                .gravity("Center")
                .extent(dimensionWithGutter, dimensionWithGutter, '!')
                .toBuffer(
                    'png',
                    function(err,
                        buffer) {
                        if (err) {
                            next(err);
                        } else {
                            next(null,
                                buffer,
                                key);
                        }
                    });
            },
            function upload(data, index, next) {
                // Stream the transformed image to a different folder.
                console.log("Uploading " + fileName);
                s3.putObject({
                    Bucket: dstBucket,
                    Key: "images/" + _sizesArray[
                            index].destinationPath +
                        "/" + fileName.slice(0, -4) +
                        ".png",
                    Body: data,
                    ContentType: 'PNG'
                }, next);
            }
        ], function(err, result) {
            if (err) {
                context.fail(util.inspect(err, {
                    depth: 15
                }));
            }
            callback();
        });
    }, function(err) {
        if (err) {
            console.error('---->Unable to resize ' + srcBucket +
                '/' + srcKey + ' and upload to ' + dstBucket +
                '/images' + ' due to an error: ' + err);
            context.fail(err);
        } else {
            console.log('---->Successfully resized ' + srcBucket +
                srcKey + ' and uploaded to' + dstBucket + "/images/" + fileName.slice(0, -4) + ".png");
        }
        context.done();
    });
};
