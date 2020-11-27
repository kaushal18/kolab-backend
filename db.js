let data = "";

function saveMessage(msg) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      data = msg;
      resolve();
    }, 1000);
  });
}

function getMessage() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(data);
    }, 1000);
  });
}

module.exports = {
  saveMessage,
  getMessage,
};
