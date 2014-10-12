var console = require('vertx/console');
var vertx = require('vertx');

var server = vertx.createHttpServer();
var routeMatcher = new vertx.RouteMatcher();
var timer = require('vertx/timer');
var container = require('vertx/container');
var eventBus = require('vertx/event_bus');

var ArticleNumber = 0;

routeMatcher.get('/', function (req) {

    var output_db = function (){

        container.deployModule('io.vertx~mod-mongo-persistor~2.1.0', {
            address: 'testdb.persistor',
            db_name: 'testdb',
            host: '127.0.0.1', 
            port: 27017
        });

        eventBus.send(
            'testdb.persistor',
            {action: "find", collection: "testcoll", matcher:{}},
            function (reply) {
                if (reply.status == 'ok') {
                    var books = [];
                    reply.results.forEach(function (el, i) {
                        books.push(new Book(el));
                    });

                    req.response.putHeader('Content-Type', 'application/json');
                    req.response.end(JSON.stringify(books));
                } else {
                    console.log('EXCEPTION='+reply.status);
                    req.response.end('No data found : ');
                }
            });
    };

    function Book(el) {
        this.ArticleNumber = ArticleNumber;
        this.Title = el.Title;
        this.Writer = el.Writer;
        this.Id = el.Id;
        this.Content = el.Content;
        this.WriteDate = el.WriteDate;
        this.ImgName = el.ImgName;
    };

    output_db();
});


routeMatcher.post('/upload', function (req) {
    
    req.dataHandler(function(buffer){

        var contentType = req.headers().get('Content-Type');

        if (contentType == 'application/x-www-form-urlencoded') { 
            var testData = [];
            var map = {};
            java.net.URLDecoder.decode(buffer.toString(), 'UTF-8') .split('&').forEach(function(data) {
                var s = data.split('='); 

                map[s[0]] = s[1];

                testData.push(s[1]);

            });


            input_db(this.ArticleNumber ,testData);
            ArticleNumber++;
                req.response.end('ok');

        } else {
            
            // req.expectMultipart(true);
            // //console.log("else 부분." +buffer.toString());
            // req.uploadHandler(function (upload) {
            //     upload.streamToFileSystem("/static/image/" + upload.filename());
            // });

            // req.endHandler(function () {
            //     req.response.end("upload complete");
            // });
        }
        
    });
});


routeMatcher.get('/image/:imgName', function (req) {
        var img = req.params().get('imgName');
        console.log(req.path());
        console.log(req);
        console.log(img);

        req.response.sendFile('static/image/' + img);
});

server.requestHandler(routeMatcher).listen(8080);



//나중에 verticle로 재구성할 모듈
//1) input_db : 클라이언트에서 넘어온 데이터를 mongodb에 넣는 모듈
var input_db = function (articleNumber, data) {
    var ArticleNumber = articleNumber;
    container.deployModule('io.vertx~mod-mongo-persistor~2.1.0', {
            address: 'testdb.persistor',
            db_name: 'testdb'
    });

    var inputData = [];
    inputData.push(data);

    //timer
    timer.setTimer(2000, function() {
            console.log('input db !!');
                    eventBus.send(
                            'testdb.persistor',
                            { action: "save", collection: "testcoll", 
                              document: { 
                                    "ArticleNumber": ArticleNumber,
                                    "Title": data[0],
                                    "Writer": data[1],
                                    "Id": data[2],
                                    "Content": data[3],
                                    "WriteDate": data[4],
                                    "ImgName": data[5]
                                    }
                            },
                            function (reply) {
                                    console.log(reply.status);
                                    console.log(reply._id);
                            });
    });
};