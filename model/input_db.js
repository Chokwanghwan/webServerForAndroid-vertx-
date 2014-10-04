var vertx = require('vertx');
var console = require('vertx/console');
var container = require('vertx/container');
var eventBus = require('vertx/event_bus');
var timer = require('vertx/timer');

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
];


container.deployModule('io.vertx~mod-mongo-persistor~2.1.0', {
    address: 'kwangdb.persistor',
    db_name: 'kwangdb'
});

timer.setTimer(2000, function() {
    eventBus.send(
        'kwangdb.persistor',
        { action: "save", collection: "testcoll", document: { "ArticleNumber": sb[0].ArticleNumber, "Title": sb[0].Title} },
        function (reply) {
            console.log(reply.status);
            console.log(reply._id);
        });
});