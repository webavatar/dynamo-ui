const express = require("express")
var cors = require('cors')
const path = require("path")
var fs = require('fs')
const busboy = require('connect-busboy');

const app = express()

var cookieParser = require('cookie-parser');
const { start } = require("repl");

var corsOptions = {
    origin: 'http://localhost:8000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.options('*', cors(corsOptions))
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(busboy({
    highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
})); // Insert the busboy middle-ware

class Server {

    constructor() {
        this.init();
    }

    init() {
        app.get("/*", (req, res) => {
            //console.info('Authorized user is ', res.locals.auser.email);

            let p = req.url
            res.sendFile(p, {
                root: "pages"
            });
        })

        app.use((err, req, res, next) => {
            console.error(err.message)
            if (err instanceof UnauthorizedError) {
                res.status(401).send('Unauthorized!');
            }
            res.status(500).send('Something broke!')
        })

    }

    start(port) {
        // Take any port number of your choice which
        // is not taken by any other process
        app.listen(port, function (error) {
            if (error)
                throw error
            console.info("Dynamo UI Server created Successfully on PORT " + port)
        })
    }
}

new Server().start(9001)

module.exports = {
    Server
}