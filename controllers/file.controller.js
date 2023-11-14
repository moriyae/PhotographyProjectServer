const uploadFile = require("../middleware/upload");
const fs = require("fs");
let get = require('../dal/getdata') 
let add = require('../dal/adddata')
let upd = require('../dal/update')
const baseUrl = "http://localhost:8080/upLoads/";
var formidable = require('formidable');
const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

const upload = async (req, res) => {
console.log(req.body)
console.log("hghj")
  let sess=req.session
  if(!fs.existsSync(`./upLoads/${sess.idEv}`))
   fs.mkdirSync(`./upLoads/${sess.idEv}`)
     
  try {

    await uploadFile(req, res)

    if (!req.files) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    let img = new add('AllPictures')  
    let fields = ['EventId', 'PathImg','Name', 'IsSelected'] 
    let ans
    let values
    for(let i =0;i<req.files.length;i++){
       values =[sess.idEv, `'${baseUrl}/${sess.idEv}/${req.files[i].filename}'`,`'${req.files[i].filename}'`,0] 

      ans = await img.addOne(fields, values)  
      console.log(ans);
     
    }  
 
   if(ans.success)
    res.status(200).send({
      message: "התמונה הועלתה בהצלחה: " + req.files[0].filename,
    });
  } catch (err) {
   
    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }
    else
    res.status(500).send({
      message: `Could not upload the file: ${req.files}. ${err}`,
    });
  }

};

const getListFiles =async (req, res) => {
let id= req.params.id 
let sess = req.session;
sess.idEv=id
req.session.save(function(err) {
  return Promise.resolve();
})

  let pictures= new get('AllPictures')
  let ans= await pictures.findOne(`EventId =${id}`)
  if(ans.success)
  res.status(200).send(ans.data);
  else
  res.send(undefined)
};

const getAllPublishedFiles =async (req, res) => {
    req.session.save(function(err) {
      return Promise.resolve();
    })
  
    let pictures= new get('AllPictures')
    let query='inner join AllEvents on AllPictures.EventId = AllEvents.Id where AllPictures.isPublished=1'
    let ans = await pictures.findInnerJoin('PathImg, Category',`${query}`)
    if(ans.success){
    res.status(200).send(ans.data);
    }
    else
    res.send(undefined)
  };
 

const updateImgSelected= async(req, res)=>{
 
  let img = new upd('AllPictures')  
    console.log(req.body)
    let ans
    let bool
   
    for(let i =0;i<req.body.length;i++){
      if(req.body[i].IsSelected)
   bool=1
   else if(!req.body[i].IsSelected)
   bool=0
      ans = await img.update(`IsSelected = ${bool}`,req.body[i].Id)  
    } 
    if(ans.success)
    res.status(200).send({ 
      message: "update succeeded",
    });
    else
    res.send(undefined)
}

const changePass= async(req, res)=>{
  console.log('on change pass')
  console.log(req.body);
  let pass = new upd('Clients')  
  ans = await pass.update(`UserPassword = '${req.body.newPass}'`,req.body.id) 
  console.log(ans.success);
  if(ans.success)
  res.status(200).send(ans.data);
  else
  res.send(undefined)
}


const mail =async (req, res)  => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'shmuelphotographer1@gmail.com',
      pass: 'pecp zgwg droz hwjo'
    }
  });

  var result =await transporter.sendMail({
        from: 'shmuelphotographer1@gmail.com',
        to: req.body.mail,
        subject: req.body.sub,
        text: req.body.txt
  });

  res.send(JSON.stringify(result, null, 4));

}


module.exports = {
  upload,
  getListFiles,
  updateImgSelected,
  changePass,
  getAllPublishedFiles,
  mail
};