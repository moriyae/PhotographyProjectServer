
let Router = require('express-promise-router')
let my_path = require('path')
let get = require('../dal/getdata')
let add = require('../dal/adddata')
const nodemailer = require('nodemailer');
const controller = require("../controllers/file.controller");
let fs = require('fs')
let AdmZip = require('adm-zip');
const update = require('../dal/update');

let router = new Router()
router.post('/changePublicationOfImage', async (req, res) => {
    console.log(req.body)
    let valueToChange=req.body.isPublished==true?0:1;
    let up = new update('AllPictures')
    let query=`isPublished=${valueToChange}`
    let a=await up.update(query, req.body.Id)  
    console.log(a)  
    res.send(a)

})

router.get('/getEvents/:id', async (req, res) => {
    console.log(req.params.id)
    let event = new get('AllEvents')
    let ans = await event.findOne(`ClientId='${req.params.id}'`)
    console.log(ans)
    console.log(req.body.id)
    if (ans.success)
        res.send(ans.data)
    else
    res.send(undefined)
})


router.post('/downLoad', async (req, res) => {
   console.log(req.body)
    let sess = req.session
    let files


    console.log(__dirname.substring(0,33))
    var path=require('path').resolve(__dirname, '..');
    console.log(__dirname)
    if(req.body.length>1){
        let zip = new AdmZip();  
        req.body.forEach(n=>{  

            files=my_path.join(path,`./upLoads/${sess.idEv}/${n}`)
            zip.addLocalFile(files);
        })

        // get everything as a buffer
        let zipFileContents = zip.toBuffer();
        const fileName = 'uploads.zip';
        const fileType = 'application/zip';
        res.writeHead(200, {
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Type': fileType,
        })
        return res.end(zipFileContents);
    }

    else{
        let file=my_path.join(path,`./upLoads/${sess.idEv}/${req.body[0].Name}`);
        res.sendFile(file)
    }
})



const mail = (details) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'moriyae2000@gmail.com',
            pass: '211341086'
        }
    });
    var mailOptions = {
        from: 'moriyae2000@gmail.com',
        to: details.mail,
        subject: details.sub,
        text: details.txt
    };
    transporter.sendMail(mailOptions, function (error, info) {

        if (error) {
            console.log(error);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    })
}
router.post('/sendMail', async (req, res) => {
    mail(req.body)
    res.send(true)
})

router.post('/copyImg', async (req, res) => {
    let events = new get('AllEvents')
    let ans1 = await events.findOne(`Id='${req.body.EventId}'`)     
    let categories = new get('Categories')
    let ans2 = await categories.findOne(`Id='${ans1.data[0].Category}'`)        
    var categoryId=ans2.data[0].Id;
    fs.copyFile((my_path.join('upLoads/' +req.body.EventId +`/${req.body.Name}`)),
                 my_path.join('images/'+categoryId+'/'+req.body.Name), (err) => {
        if (err) throw err;
    });
    let up = new update('AllPictures')
    let query=`isPublished=1`;
    let a=await up.update(query, req.body.Id) 
    res.send(true)
})

router.post('/deleteImgFromPublic', async (req, res) => {
    let events = new get('AllEvents')
    let ans1 = await events.findOne(`Id='${req.body.EventId}'`)     
    let categories = new get('Categories')
    let ans2 = await categories.findOne(`Id='${ans1.data[0].Category}'`)        
    var categoryId=ans2.data[0].Id;
    fs.unlink(my_path.join('images/'+categoryId+'/'+req.body.Name), (err) => {
        if (err) throw err;
    });
    let up = new update('AllPictures')
    let query=`isPublished=0`
    let a=await up.update(query, req.body.Id) 
    res.send(true)
})




router.post("/updateImgSelected", controller.updateImgSelected);
router.get("/:id", controller.getListFiles);
router.post('/changePass', controller.changePass);

module.exports = router