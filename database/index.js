// 'use strict';
const knex = require('../knex/knex.js');

/* Helper functions */

//determines if the photos in between the new & old order is going 
//to increment or decrement and sets the starting/end points
var getStatus = (obj, cb) => {
  var status = {};
  if (obj.oldOrder === obj.newOrder) {
    return cb('equal', null); 
  } else if (obj.oldOrder > obj.newOrder) {
    status.shiftBy = (num) => { return num + 1; };
    status.head = obj.newOrder;
    status.tail = obj.oldOrder;
    status.add = true;
  } else if (obj.oldOrder < obj.newOrder) {
    status.shiftBy = (num) => { return num - 1; };
    status.head = obj.oldOrder;
    status.tail = obj.newOrder;
    status.add = false;
  }
  return cb(null, status);
};

//returns an array of the photos that are between the 
//start(head) and end(tail) points that need updating
var getBtwnPhotos = (obj, cb) => {
  knex('photos').where({
    house_id: obj.house_id
  })
    .whereBetween('img_order', [obj.head, obj.tail])
    .select('img_url', 'img_order', 'house_id')
    .orderBy('img_order')
    .then((rows) => {
      return cb(null, rows);
    })
    .catch((error) => {
      return cb(error);
    });
};

//updates the order for a single photo, and returns the next index
var updateOrder = (pic, order, cb, indx) => {
  knex('photos').where({
    img_url: pic.img_url,
    house_id: pic.house_id
  })
    .update({
      img_order: order
    })
    .then(()=>{ 
      return cb(null, indx + 1);
    })
    .catch((error) => {
      return cb(error);
    });
};

var deletePhoto = (house, picture, cb) => {
  knex('photos').where({
    house_id: house,
    img_order: picture
  })
  .del()
  .then((rows) => {
    return cb(null, rows);
  })
  .catch((error) => {
    return cb(error);
  });
}

var postPhoto = (house, url, cb) => {
  knex('photos').where({
    house_id: house
  })
  .insert({house_id: house, img_url: url})
  .then((rows) => {
    return cb(null, rows);
  })
  .catch((error) => {
    return cb(error);
  });
}

var updateImgURL = (house, picture, url, cb) => {
  knex('photos').where({
    house_id: house,
    img_order: picture
  })
  .update('img_url', 'https://loremflickr.com/250/200?random=' + url)
  .then((rows) => {
    return cb(null, rows);
  })
  .catch((error) => {
    return cb(error);
  });
}

//function that will update an array of photos
var shiftImgs = (gallery, status, cb) => {
  if (status.add) {
    var start = 0;
    var end = gallery.length - 1;
  } else {
    var start = 1;
    var end = gallery.length;
  }

  //method to update each image when we rearrange the photo's order
  var updateEachImg = (i, end, cb) => {
    return updateOrder(gallery[i], status.shiftBy(gallery[i].img_order), (err, index) => {
      //check if the returned index is valid to update next img
      if (err) { 
        return cb(err); 
      } else if (index >= end) {
        return cb(err); 
      } else {
        return updateEachImg(index, end, cb);
      }
    }, i);
  };

  return updateEachImg(start, end, cb);
};

var checkHouseID = (id, cb) => {
  knex('photos').where({
    house_id: id
  })
  .select('*')
    .then((rows) => {
      if(rows.length <= 0) return cb(false);
      return cb(true);
    })
    .catch((error) => {
      console.log('error');
      return false;
    });
};
/******************************************* */

//returns array for photos belonging to a specific house_id
var getImg = (house_id, cb) => {
    //check if house id exists
    return knex('photos').where({
      house_id: house_id
    })
    .select ('img_url', 'img_order')
    .orderBy('img_order')
    .then ((rows) => {
      //is passing when house_id does not exist?
      if (rows.length <= 0) {
        cb (null, [{"img_url":"https://loremflickr.com/250/200?error=1","img_order":'0'}]);
      } else {
        cb (null, rows);
      }
    })
    .catch ( (error) => {
      console.log('ERROR: ', error);
      cb (null, [{"img_url":"https://loremflickr.com/250/200?error=1","img_order":'0'}]);
    });
};

var changeOrder = (pic, cb) => {
  return getStatus (pic, (err, status) => {
    if (err) {
      return getImg (pic.house_id, cb);
    } else {
      status['house_id'] = pic.house_id;
      return getBtwnPhotos (status, (err, result) => {
        if (err) {
          return cb (err);
        } else if (result.length < pic.oldOrder || pic.oldOrder < 0) {
          return cb('Order number is out of range');
        } else {
          return updateOrder(pic, pic.newOrder, (err) => {
            if (err) {
              return cb(err);
            } else {
              return shiftImgs(result, status, (err)=>{
                if (err) {
                  return cb(err);
                } else {
                  return getImg (pic.house_id, cb);
                }
              });
            }
          });
        }
      });
    }
  });

};


module.exports = {getImg, changeOrder, deletePhoto, updateImgURL, postPhoto};