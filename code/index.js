var handler = require("./imageSyncing");

var payload = require("./modules/payload");
var context = {
    fail: function(info) {
        console.error(info);
    },
    done: function() {
        console.log("All done");
    }
};

handler.handler(payload, context);
