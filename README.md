Simple responsive checking library
==================================


Example
-------

    var responsive = require('responsive');
    var r = responsive({
            "portable": "screen and (max-width: 1023px)",
            "desk":     "screen and (min-width: 1024px)",
        });
        
    console.log(r.is('desk'));
