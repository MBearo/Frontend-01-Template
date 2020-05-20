const net = require('net')

class Request {
  constructor(options) {
    this.method = options.method || 'GET';
    this.host = options.host;
    this.path = options.path || '/';
    this.port = options.port || 80;
    this.body = options.body || {};
    this.headers = options.headers || {};

    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body);
    }

    if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.entries(this.body)
        .map(([key, value]) => {
          return `${key}=${encodeURIComponent(value)}`;
        })
        .join('&');
      this.headers['Content-Length'] = this.bodyText.length;
    }
    //console.log(this.toString());
  }
  toString() {
    return [
      `${this.method} ${this.path} HTTP/1.1`,
      `Host: ${this.host}`,
      `${Object.entries(this.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n')}`,
      '',
      `${this.bodyText}`
    ].join('\r\n')
  }
  send(connection) {
    return new Promise((resolve, reject) => {
      const parse = new ResponseParser();
      connection = net.createConnection({
        host: this.host,
        port: this.port,
      }, () => {
        connection.write(this.toString())
      })
      connection.on('data', (data) => {
        parse.receive(data.toString());
        if (parse.isFinished) {
          resolve(parse.response);
        }
        connection.end();

      });
      connection.on('error', (err) => {
        console.log('error');
        reject(err);
        connection.end();
      });
    })
  }
}

class ResponseParser {
  constructor() {
    this.WAITING_STATUS_LINE = 0;
    this.WAITING_STATUS_LINE_END = 1;
    this.WAITING_HEADER_NAME = 2;
    this.WAITING_HEADER_SPACE = 3;
    this.WAITING_HEADER_VALUE = 4;
    this.WAITING_HEADER_LINE_END = 5;
    this.WAITING_HEADER_BLOCK_END = 6;
    this.WAITING_BODY = 7;

    this.current = this.WAITING_STATUS_LINE;
    this.statusLine = "";
    this.headers = {};
    this.headerName = "";
    this.headerValue = "";
    this.bodyParse = null;
  }
  get isFinished() {
    return this.bodyParse && this.bodyParse.isFinished
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
    return {
      statusCode: RegExp.$1,
      statusTex: RegExp.$2,
      headers: this.headers,
      body: this.bodyParse.content.join('')
    }
  }
  receive(string) {
    for (let i = 0; i < string.length; i++) {
      this.receiveChar(string.charAt(i));
    }
  }
  receiveChar(char) {
    if (this.current === this.WAITING_STATUS_LINE) {
      if (char === '\r') {
        this.current = this.WAITING_STATUS_LINE_END
      } else {
        this.statusLine += char
      }
    }

    else if (this.current === this.WAITING_STATUS_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME
      }
    }

    else if (this.current === this.WAITING_HEADER_NAME) {
      if (char === ':') {
        this.current = this.WAITING_HEADER_SPACE
      } else if (char === '\r') {
        this.current = this.WAITING_HEADER_BLOCK_END
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          this.bodyParse = new TrunkedBodyParser();
        } else {
          this.bodyParse = new TrunkedBodyParser();
        }
      } else {
        this.headerName += char
      }
    }

    else if (this.current === this.WAITING_HEADER_SPACE) {
      if (char === ' ') {
        this.current = this.WAITING_HEADER_VALUE
      }
    }

    else if (this.current === this.WAITING_HEADER_VALUE) {
      if (char === '\r') {
        this.current = this.WAITING_HEADER_LINE_END
        this.headers[this.headerName] = this.headerValue
        this.headerName = ""
        this.headerValue = ""
      } else {
        this.headerValue += char
      }
    }

    else if (this.current === this.WAITING_HEADER_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME
      }
    }

    else if (this.current === this.WAITING_HEADER_BLOCK_END) {
      if (char === '\n') {
        this.current = this.WAITING_BODY
      }
    }

    else if (this.current === this.WAITING_BODY) {
      //console.log('WAITING_BODY', char);
      this.bodyParse.receiveChar(char)
    }
  }
}

class TrunkedBodyParser {
  constructor() {
    this.WAITING_LENGTH = 0;
    this.WAITING_LENGTH_LINE_END = 1;
    this.READING_TRUNK = 2;
    this.WAITING_NEW_LINE = 3;
    this.WAITING_NEW_LINE_END = 4;
    this.FINISHED_NEW_LINE = 5;
    this.FINISHED_NEW_LINE_END = 6;
    this.isFinished = false;
    this.length = 0;
    this.content = [];
    this.current = this.WAITING_LENGTH;
  }
  // 字符流处理
  receiveChar(char) {
    if (this.current === this.WAITING_LENGTH) {
      if (char === '\r') {
        if (this.length === 0) {
          this.current = this.FINISHED_NEW_LINE
        } else {
          this.current = this.WAITING_LENGTH_LINE_END
        }
      } else {
        this.length *= 16
        //console.log('r:',this.length);
        this.length += parseInt(char, 16)
      }
    }

    else if (this.current === this.WAITING_LENGTH_LINE_END) {
      if (char === '\n') {
        this.current = this.READING_TRUNK
      }
    }

    else if (this.current === this.READING_TRUNK) {
      this.content.push(char)
      this.length--
      if (this.length === 0) {
        this.current = this.WAITING_NEW_LINE
      }
    }

    else if (this.current === this.WAITING_NEW_LINE) {
      if (char === '\r') {
        this.current = this.WAITING_NEW_LINE_END
      }
    }

    else if (this.current === this.WAITING_NEW_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_LENGTH
      }
    }

    else if (this.current === this.FINISHED_NEW_LINE) {
      if (char === '\r') {
        this.current = this.FINISHED_NEW_LINE_END
      }
    }

    else if (this.current === this.FINISHED_NEW_LINE_END) {
      if (char === '\n') {
        this.isFinished = true
      }
    }
  }
}
module.exports = Request