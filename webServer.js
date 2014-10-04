var console = require('vertx/console');
var vertx = require('vertx');

var server = vertx.createHttpServer();
var routeMatcher = new vertx.RouteMatcher();
var timer = require('vertx/timer');
var container = require('vertx/container');
var eventBus = require('vertx/event_bus');

//test data
//서버에서 클라이언트로 데이터를 전송하는 output_db 모듈 개발 완료 시 폐기.
var sb = [
                                {"ArticleNumber": "1",
                                "Title": "오늘도 좋은 하루!",
                                "Writer": "광구",
                                "Id": "6613d02f3e2153283f23bf621145f877",
                                "Content": "웹서버 연동 성공!!",
                                "WriteDate": "2013-09-23-10-10",
                                "ImgName": "photo1.jpg"},

                                {"ArticleNumber": "2",
                                "Title": "대출 최고 3000만원",
                                "Writer": "김미영 팀장",
                                "Id": "6326d02f3e2153266f23bf621145f734",
                                "Content": "김미영팀장 입니다. 고갱님께서는 최저이율로 최고 3000만원까지 30분 이내 통장입금가능합니다.",
                                "WriteDate": "2013-09-24-11-22",
                                "ImgName": "photo2.jpg"},

                                {"ArticleNumber": "3",
                                "Title": "MAC등록신청",
                                "Writer": "학생2",
                                "Id": "8426d02f3e2153283246bf6211454262",
                                "Content": "1a:2b:3c:4d:5e:6f",
                                "WriteDate": "2013-09-25-12-33",
                                "ImgName": "photo3.jpg"},

                                {"ArticleNumber": "4",
                                "Title": "개발을합니다",
                                "Writer": "광구",
                                "Id": "8426d02f3e2153283246bf6211452074",
                                "Content": "Android Development",
                                "WriteDate": "2014-10-1-17-40",
                                "ImgName": "photo4.jpeg"}
                        ];


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
        this.id = el._id.$oid;
        this.product = el.product_name;
        this.ArticleNumber = el.ArticleNumber;
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

                console.log("s[1] = " + s[1]);

                testData.push(s[1]);

            });
            
            console.log('testData = ' +testData);
            input_db(testData);

        } else {
            //이 부분 잠시 빠염.
            //console.log(buffer.toString());
            //console.log('here is image area');;
        }
        
    });
    req.response.end('yoman');
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
var input_db = function (data) {

    container.deployModule('io.vertx~mod-mongo-persistor~2.1.0', {
            address: 'testdb.persistor',
            db_name: 'testdb'
    });

    var inputData = [];
    inputData.push(data);

    for (var i=0; i<inputData.length; i++) {
        console.log('inputData[' +i+ '] = ' + inputData[i]);
    }

    //timer
    timer.setTimer(2000, function() {
            console.log('FUCK');
                    eventBus.send(
                            'testdb.persistor',
                            { action: "save", collection: "testcoll", 
                              document: { 
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