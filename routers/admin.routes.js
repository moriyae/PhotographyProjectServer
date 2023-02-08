
var express = require('express');
var router = express.Router();
let my_fs = require('fs')
const fsPromises = require('fs').promises
let get = require('../dal/getdata')
let add = require('../dal/adddata')
let upd = require('../dal/update')
const controller = require("../controllers/file.controller");
// const { query } = require('express');

if (!my_fs.existsSync('./upLoads'))
  my_fs.mkdirSync('./upLoads')

// const  multipart  =  require('connect-multiparty');
// const  multipartMiddleware  =  multipart({ uploadDir:  '../upLoads' });

// router.post('/upload', multipartMiddleware, (req, res) => {
//   console.log("in upload file")
//   res.json({
//       'message': 'File uploaded successfully'
//   });
// });


router.post('/addNewClient', async (req, res) => {
  console.log(req.body)
  let id = req.body.id
  let un = req.body.user.username
  let pass = req.body.user.password
  let phone = req.body.user.phone
  let firstname = req.body.user.firstName
  let lastname = req.body.user.lastName
  let mail = req.body.user.mail
  let IsAdmin = req.body.user.isAdmin
  let fields
  let values
  let ans = {
    message: ''
  }
  // let g = new get('Clients')
  // let i=await g.findOne(`UserName='${un.trim()}' AND UserPassword='${pass.trim()}'`)
  // if(i[0]==undefined){

  fields = ['UserName', 'UserPassword', 'Phone', 'FirstName', 'LastName','IsAdmin', 'Mail']
  values = [`N'${un}'`, `'${pass}'`, `'${phone}'`, `N'${firstname}'`, `N'${lastname}'`, `${IsAdmin}`, `'${mail}'`]
  if (id == -1) {
    let ge = new get('Clients')
    let allPasswords = await ge.findAll('UserPassword')
    if (!allPasswords.success) {
      ans = {
        message: 'שגיאת שרת'
      }
    }
    else {
      allPasswords.data.forEach(p => {
        if (p.UserPassword == pass) {
          ans = {
            message: 'נא לבחור סיסמא אחרת'
          }
        }
      })
    }

    if (ans.message == '') {

      let a = new add('Clients')
      let t1 = await a.addOne(fields, values)
      if (t1.success) {
        ans = {
          message: 'הלקוח נוסף בהצלחה'
        }
      }
      else
        ans = {
          message: 'שגיאת שרת'
        }
      res.send(ans)
    }
    else
      res.send(ans)
  }

  else {
    let quer = `${fields[0]}=${values[0]}`
    for (let i = 1; i < fields.length; i++) {
      quer += `, ${fields[i]} = ${values[i]}`
    }
    let up = new upd('Clients')
    let t2 = await up.update(quer, id)
    if (!t2.success) {
      ans = {
        message: 'שגיאת שרת'
      }
    }
    ans = {
      message: 'פרטי הלקוח עודכנו בהצלחה'
    }
    res.send(ans)
  }
})

router.post('/addEvent', async (req, res) => {

  // let nameEvent = req.body.eve.nameEvent
  // let dateEvent = req.body.eve.dateEvent
  // let clientId = req.body.clientId
  let eventId = req.body.eventId
  let fields
  let values
  fields = ['ClientId', 'NameEvent', 'Date','Category','details']
  values = [`'${req.body.ClientId}'`, `N'${req.body.NameEvent}'`, `'${req.body.Date}'`,`N'${req.body.Category}'`,`N'${req.body.details}'`]
  if (eventId != -1) {
    let quer = `${fields[0]} = ${values[0]}`
    for (let i = 1; i < fields.length; i++)
      quer += `, ${fields[i]} = ${values[i]}`
    let up = new upd('AllEvents')
    let t = await up.update(quer, eventId)
    if (t.success)
      res.send(true)
    else
      res.send(false)
  }
  else {
    let a1 = new add('AllEvents')
    let t1 = await a1.addOne(fields, values)

    if (t1.success)
      res.send(true)
    else
      res.send(false)
  }
})


router.get('/getAllEvents',async (req,res)=>{
  console.log('gatall')
  let events = new get('AllEvents')
  let ans = await events.findAll('*')
  console.log(ans)
  console.log(events)
  if (ans.success)
      res.send(ans.data)
  else
  res.send(undefined)
})


router.get('/getAllEventsWithDetails',async (req,res)=>{
  let events = new get('AllEvents')
  let ans = await events.findInnerJoin('*, AllEvents.Id as eventId, Clients.Id as clientId','inner join Clients on AllEvents.ClientId=Clients.Id')
  console.log(ans)
  console.log(events)
  if (ans.success)
      res.send(ans.data)
  else
  res.send(undefined)
})




router.get('/deletingAnEvent/:eventId', async (req, res) => {

  console.log(req.params.eventId)
  console.log(req.params)
  let idEvent = req.params.eventId
  console.log(idEvent)
  try {
    if (my_fs.existsSync(`./upLoads/${idEvent}`)) {
    my_fs.rmSync(`./upLoads/${idEvent}`, { recursive: true, force: true })
    }
  }
  catch (ex) {
    console.log('exception' + ex);
  }
  // if (err) return console.log(err);
  let a = new add('AllPictures')

  let t = await a.deleteOne(`EventId=${idEvent}`)
  if (t.success) {
    let a1 = new add('AllEvents')
    let t1 = await a1.deleteOne(`Id=${idEvent}`)
    // console.log(t1)
    if (t1.success) {
      res.send(true)
    }
    else {
      res.send(false)
    }
  }
})

router.post('/deletingImg', async (req, res) => {
  let i = req.body.id
  console.log(i)
  let field = req.body.field
  let name = i.Name
  let idEvent = i.EventId
  console.log(name+' '+idEvent)
  if (name == undefined || idEvent == undefined) {
    const directory = `./upLoads/${idEvent}/${name}`
    await fsPromises.rmdir(directory, {
      recursive: true
    })
    // my_fs.rmSync(dir, { recursive: true, force: true });

  }
  else {
    my_fs.stat(`./upLoads/${idEvent}/${name}`, async function (err, stats) {
      console.log(stats);//here we got all information of file in stats variable

      if (err) {
        return console.error(err);
      }

      my_fs.unlink(`./upLoads/${idEvent}/${name}`, async function (err) {
        if (err) return console.log(err);
      });
    })
  }
  let ad = new add('AllPictures')
  let t = await ad.deleteOne(`${field}=${i.Id}`)

  if (t.success) {
    console.log('file deleted successfully')
    res.send(true)
  }

  else {
    res.send(false)
  }

});

  // let ans = await u.findOne(`username = '${req.body.username.trim()}' and UserPassword = '${req.body.pass.trim()}' `)
  // console.log(ans) 
  // console.log(req.sessionID,'login')
  // if (ans.name == 'ConnectionError') {
  //   // console.log('err:',ans,'end')
  //   res.status(500).send(ans);
  // }
  // else if (ans[0] == undefined) {

  //   res.send(false)

  // }
  // else {

  //   let sess = req.session;

  //   sess.username = ans[0].UserName
  //   sess.isAdmin = ans[0].IsAdmin
  //   sess.password = ans[0].UserPassword

  //   req.session.save(function (err) {
  //     return Promise.resolve();

  //   })

  //   res.send(ans[0])
  // }


router.post("/upLoad", controller.upload);

// fs.unlink('fileToBeRemoved', function(err) {
//   if(err && err.code == 'ENOENT') {
//       // file doens't exist
//       console.info("File doesn't exist, won't remove it.");
//   } else if (err) {
//       // other errors, e.g. maybe we don't have enough permission
//       console.error("Error occurred while trying to remove file");
//   } else {
//       console.info(`removed`);
//   }
// });

// const deleteFile = './docs/deleteme.txt'
// if (fs.existsSync(deleteFile)) {
//     fs.unlink(deleteFile, (err) => {
//         if (err) {
//             console.log(err);
//         }
//         console.log('deleted');
//     })
// }

// שליפה של תמונות לפרסם לפי אירועים
// select AllPictures.PathImg+'\'+AllPictures.Name as path
// from AllPictures left join AllEvents 
// on AllPictures.EventId = AllEvents.Id 
// where (AllPictures.IsSelected = 1) 
// and (AllEvents.NameEvent='wedding')

module.exports = router