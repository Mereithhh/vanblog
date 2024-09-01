const http = require('http');

http
  .createServer((request, response) => {
    const { headers, method, url } = request;
    let body = [];
    request
      .on('error', (err) => {
        console.error(err);
      })
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        // BEGINNING OF NEW STUFF
        console.log(JSON.stringify(headers, null, 2));
        response.on('error', (err) => {
          console.error(err);
        });
        console.log(body);
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        const responseBody = { headers, method, url, body };

        response.write(JSON.stringify(responseBody));
        response.end();
      });
  })
  .listen(1337);
