'use strict';

const http = require('node:http');
const fs = require('node:fs');
const receiveArgs = require('./body.js');

require('./schema.js').load('./schema/');
const api = require('./api.js').load('./api/');

const httpError = (res, status, message) => {
  res.statusCode = status;
  res.end(`"${message}"`);
};

http.createServer(async (req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const [first, second] = url.slice(1).split('/');
  if (first === 'api') {
    const method = api.get(second);
    const args = await receiveArgs(req);
    try {
      const result = await method(...args);
      if (!result) {
        httpError(res, 500, 'Server error');
        return;
      }
      res.end(JSON.stringify(result));
    } catch(err) {
      console.dir({ err });
      httpError(res, 500, 'Server error');
    }
  } else {
    const path = `./static/${first}`;
    try {
      const data = await fs.promises.readFile(path);
      res.end(data);
    } catch(err) {
      httpError(res, 404, 'File is not found');
    }
  }
}).listen(8000);
