let data = {};

function saveMessage(room, msg) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      data[room] = msg;
      resolve();
    }, 1000);
  });
}

function getMessage(room) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(data[room]);
    }, 1000);
  });
}

module.exports = {
  saveMessage,
  getMessage,
};
