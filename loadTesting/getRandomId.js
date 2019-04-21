const getRandomId = (context, events, done) => {
  const min = 9000000;
  const max = 10000000;
  const maxPhotosNum = 8;
  const photoId = Math.floor(Math.random() * (max - min + 1) + min);
  const photo = Math.floor(Math.random() * maxPhotosNum);
  const randomURL = Math.floor(Math.random() * 1000);

  context.vars.photoId = photoId;
  context.vars.photo = photo;
  context.vars.randomURL = randomURL;
  return done();
}

module.exports = {
  getRandomId
};