const Request = require('../week05/client')
const parseHTML = require('./HTMLParser')
// void async function () {
//   const options = {
//     method: "GET",
//     path: "/",
//     host: "127.0.0.1",
//     port: 8088,
//     body: {
//       name: "111"
//     }
//   }

//   let request = new Request(options)

//   let response = await request.send()
//   console.log('response=>', response)
// }()
console.log(JSON.stringify(parseHTML(`
<html lang="en">
<head>
  <title>Document</title>
</head>
<body>
  <div>
    <p id="3" class='4'></p>
  </div>
</body>
</html>`)));
