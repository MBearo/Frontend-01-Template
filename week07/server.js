const http = require('http')
const server = http.createServer((req, res) => {
    console.log("request is: ")
    console.log(req.headers)
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('X-Foo', 'bar')
    res.writeHeader(200, {'Content-Type': 'text/plain'})
    res.end(
`<html meta=a>
<head>
    <style>
#container {
    width:500px;
    height:300px;
    display:flex;
}
#container #myid {
    width:200px;
    background-color: rgba(255, 165, 0);
}
#container .c1 {
    flex: 1;
    background-color: rgba(255, 99, 71);
}
    </style>
</head>
<body>
    <div id="container">
        <div id="myid"/>
        <div class="c1" />
    </div>
</body>
</html>
`)
})

server.listen(8088)