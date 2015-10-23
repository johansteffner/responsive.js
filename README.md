Simple responsive checking library
==================================


Example
-------
```js
var responsive = require('responsive-js');
var r = responsive({
        "portable": "screen and (max-width: 1023px)",
        "desk":     "screen and (min-width: 1024px)",
    });
    
console.log(r.is('desk'));
```
