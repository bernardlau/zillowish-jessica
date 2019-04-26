require('newrelic');

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var db = require('../database/index');
var cors = require('cors');    
var port = 3002;

var redis = require('redis');
var REDIS_PORT = process.env.REDIS_PORT;
var client = redis.createClient(REDIS_PORT);

app.use(express.static(__dirname + '/../client/dist', {maxAge: 5000})); //sets maxAge to 5sec
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({origin:"http://localhost:3000"}));
 
app.get('/gallery/:id', cache, function (req, res) {
  var id = Number(req.params.id);
  db.getImg(id, (err, data)=> {
    if (err) {
      res.status(400).send(err);
    } else {
      client.set(JSON.stringify(id), JSON.stringify(data));
      res.status(200).send(data);
    }
  });
});

function cache(req, res, next) {
    const id = JSON.stringify(Number(req.params.id));
    client.get(id, (err, data) => {
      if (err) {
        throw err;
      }
      if (data !== null) {
        res.send(200).send(JSON.parse(data));
      } else {
        next();
      }
    });
}

app.post('/gallery/update', (req, res) => {
  var pic = {
    img_url: req.body.img,
    house_id: req.body.id,
    newOrder: req.body.newOrder,
    oldOrder: req.body.oldOrder
  };
  if(isNaN(req.body.newOrder)) {
    res.status(400).send();
  } else {
    db.changeOrder(pic, (err, data)=> {
      if(err) {
        res.status(400).send();
      } else {
        res.status(200).send(data);
      }
    });
  }
});

app.delete('/gallery/:id/photo/:photo', (req, res) => {
  db.deletePhoto(req.params.id, req.params.photo, (err) => {
    if (err) {
      res.status(400).send();
    } else {
      res.status(200).send();
    }
  });
});

app.put('/gallery/:id/photo/:photo/img/:img', (req, res) => {
  db.updateImgURL(req.params.id, req.params.photo, req.params.img, (err) => {
    if (err) {
      res.status(400).send();
    } else {
      res.status(200).send("Successfully updated photo");
    }
  });
});

app.post('/gallery/:id/img/:img', (req, res) => {
  db.postPhoto(req.params.id, req.params.img, (err) => {
    if (err) {
      res.status(400).send();
    } else {
      res.status(201).send();
    }
  });
});

app.listen(port, ()=>{
  console.log(`Listening on Port: ${port}`);
});