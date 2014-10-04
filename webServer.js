var console = require('vertx/console');
var vertx = require('vertx');

var server = vertx.createHttpServer();
var routeMatcher = new vertx.RouteMatcher();
var timer = require('vertx/timer');
var container = require('vertx/container');
var eventBus = require('vertx/event_bus');

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
    

    // timer.setTimer(2000, function () {
    //     console.log('testData 11111= ' +testData);
    //     //input_db(testData);
    //     console.log("testData's type = " + typeof(testData));
    // });
    
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
                //data.push(s[1]);
                //console.log("s[1]'s type = " + typeof(s[1]) );

                //console.log('data = ' + data);
                
                //이 로직은 넘어온 데이터 갯수만큼 반복한다. 따라서 여기서 바로 input_db()를 실행시키면
                //그 갯수만큼 db 컬럼을 만들기 때문에 패망...
                //그래서 여기서 변수를 하나 선언하고 s[1]값을 저장 시도!!! 시작!!
                
                //이렇게 switch case문 쓸 필요가 없을듯.
                //왜냐면 input_db(s[1]); 이런식으로 함수 호출하면 db에 알아서 저장될것같은데..
                //일단 input_db() 리팩토링하고 넣어보자.        
                /*
                switch (s[0]) {
                    case "title":
                        console.log(s[0] + ":" + s[1]);
                        break;
                    case "writer":
                        console.log(s[0] + ":" + s[1]);
                        break;
                    case "id":
                        console.log(s[0] + ":" + s[1]);
                        break;
                    case "content":
                        console.log(s[0] + ":" + s[1]);
                        break;
                    case "writeDate":
                        console.log(s[0] + ":" + s[1]);
                        break;
                    case "imgName":
                        console.log(s[0] + ":" + s[1]);
                        break;
                    default:
                        console.log("우리가 다루지 않는 데이터 입니다.");
                        break;
                }
                */
                //console.log(s[0]+':'+s[1]);

            });
            console.log('testData 11111= ' +testData);
            //input_db(testData);
            console.log("testData's type = " + typeof(testData));
            for (var i=0; i<testData.length; i++) {
                console.log("testData[" +i+ "] = " + testData[i]);
            }
        } else {
            //이 부분 잠시 빠염.
            //console.log(buffer.toString());
            //console.log('here is image area');;
        }
        
    });
    // console.log('req='+req);
    // req.expectMultiPart(true);

    //     req.endHandler(function(){
    //         //var attrs = req.formAttributes();
    //         //console.log('attrs'+attrs);
    //         // attrs.forEach(function (a) {
    //         //     console.log('data = ' +a);
    //         // });

    //         //var title = attrs.get('title');
    //         //console.log('TITLE='+title);
    //     });

    //input db
    var input_db = function (data) {
        var ArticleNumber = 0;

        container.deployModule('io.vertx~mod-mongo-persistor~2.1.0', {
                address: 'testdb.persistor',
                db_name: 'testdb'
        });

        var inputData = [];
        inputData.push(data);
        //console.log('inputData = ' + inputData);

        for (var i=0; i<inputData.length; i++) {
            console.log('inputData[' +i+ '] = ' + inputData[i]);
        }



        //배열하나 만들어서 input_db에 들어오는 모든 데이터를 저장한다.
        //data = [title, writer, id ... 등] 이렇게 데이터가 저장될텐데.
        //그러면 저 밑에 document에서 "Title":data[0], "Writer":data[1]... 이렇게 부르면 될듯.
        //input_db()에 인자가 들어올 때 그 값이 우리가 클라이언트에서 보내는 데이터 순서와 같다 라는 전제가 깔려있다.

        //timer
        timer.setTimer(2000, function() {
                console.log('FUCK');
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
        ArticleNumber++;
        });
    };
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