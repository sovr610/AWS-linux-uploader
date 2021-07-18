var express = require('express');   //Express Web Servervar bodyParser = require('body-parser'); //connects bodyParsing middlewarevar formidable = require('formidable');var util = require('util');var path = require('path');     //used for file pathvar fs =require('fs-extra');    //File System-needed for renaming file etcvar targz = require('tar.gz')
var uuid = require('uuid/v4')

var app = express();//app.use(express.static(path.join(__dirname, 'public')));
/* ========================================================== bodyParser() required to allow Express to see the uploaded files ============================================================ */app.use(bodyParser({defer: true}));


app.route('/upload')
  .post(function (req, res, next) {

    var form = new formidable.IncomingForm();    //Formidable uploads to operating systems tmp dir by default    var deployDir = __dirname + '/temp'    var filePath = deployDir + '/' + uuid()
    var fileName = filePath + '.tar.gz'console.log('fileName: ' + fileName)

    form.uploadDir = deployDir;       //set upload directory
    form.keepExtensions = true;     //keep file extension

    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});      res.write('received upload:\n\n');      console.log("form.bytesReceived");      //TESTING
      console.log('received fields:\n\n '+util.inspect(fields));      console.log('\n\n')
      console.log('received files:\n\n '+util.inspect(files));
      //Formidable changes the name of the uploaded file      //Rename the file to its original name      console.log("print:  " + files.chaincode.path)


      fs.move(files.chaincode.path, fileName)
        .then(() => {
          console.log('Moving success!')

          targz().extract(fileName, filePath)
            .then(function () {
              console.log('unzip successfully.')
            })
            .catch(function(err){
              console.log('Error happens when unzip', err.message)
              var resBody = {
                'description': 'Error when unzip: ' + err.message              }
              res.status(500).send(resBody)
            })


        })
        .catch(err => {
          console.error(err)
        })

      res.end();
    });  });
app.use(function (req, res) {
  if (req.url === '/') {
    res.writeHead(200, {'content-type': 'text/html'});    res.end(
      '<form action="/upload" enctype="multipart/form-data" method="post">'+
      '<input type="text" name="username"><br>'+
      '<input type = "text" name="args" value="valueB">' +
      '<input type = "text" name="attrs">' +
      '<input type="file" name="upload" multiple="multiple"><br>'+
      '<input type="submit" value="Upload">'+
      '</form>'    );  }
})

var server = app.listen(8090, function() {
  console.log('Listening on port %d', server.address().port);});