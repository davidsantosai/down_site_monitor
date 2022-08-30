/** 
 * PACKAGE REQUIREMENT
 */

const http = require('http')
const path = require('path')
const url = require('url')
const config = require('./configs')

/**
 * SERVER INITIALIZATION
 */

const server = {}

server.httpServer = http.createServer((req,res) => {
    res.writeHead(200);
    res.end('Hello, World!');
})

server.init = function (){
    server.httpServer.listen(config.httpPort, ()=>{
        console.log("\x1b[31m%s\x1b[0m",`server is running on port ${config.httpPort}`)
    })
}

module.exports = server