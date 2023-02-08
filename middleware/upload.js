const util = require("util");
const multer = require("multer");
const maxSize = 2 * 1024 * 1024;

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // await sleep(1000);

    let sess = req.session
    cb(null, __basedir + `/upLoads/${sess.idEv}`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },

});

let uploadFile = multer({

  storage: storage,
  // limits: { fileSize: maxSize },
}).array('userfiles');


let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;
// module.exports = uploadFile;
