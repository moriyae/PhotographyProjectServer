let ex = require('express')
let myPath = require('path')
let session = require('express-session')
let my_client = require('./routers/client.routes')
let admin = require('./routers/admin.routes')
let cookieParser = require('cookie-parser')
// const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
let get = require('./dal/getdata')
const controller = require("./controllers/file.controller");
var walk    = require('walk');
global.__basedir = __dirname

let app = ex()

var corsOptions = {
  origin: 'http://localhost:4200',
  credentials: true
};

app.use(ex.static('public')); 
app.use('/upLoads', ex.static('images'));

// app.all('*',function(req, res, next){

//   //Origin is the HTML/AngularJS domain from where the ExpressJS API would be called
//       res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
//       res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//       res.header('Access-Control-Allow-Headers', 'Content-Type');

//   //make sure you set this parameter and make it true so that AngularJS and Express are able to exchange session values between each other 
//       res.header("Access-Control-Allow-Credentials", "true");
//       next();

//   })
// app.use(cookieParser())

app.use(session({ secret: 'any', saveUninitialized: true, resave: true }))
// app.use(passport.initialize())
// app.use(passport.session())
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/bs', ex.static(myPath.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use(ex.urlencoded({ extended: true }))

app.get('/getAllClient/:query', async (req, res) => {

  let g = new get('Clients')
  console.log(req.params.query)
  // let s = req.session
  // console.log(s, "מנהל")
  let ans = await g.findOne(req.params.query)
  // let ans = await g.findAll('*')
console.log(ans);
  if (ans.success)
    res.send(ans.data)
  else
  res.send(undefined)
})

app.get('/getAllClients', async (req, res) => {

  let g = new get('Clients')
  let ans = await g.findAll('*')
console.log(ans);
  if (ans.success)
    res.send(ans.data)
  else
  res.send(undefined)
})

app.get("/getAll", async function(req, res){
  console.log("file");
  var files   = [];
  // Walker options
  var walker  = walk.walk(__basedir + '/upLoads//publishedImages/', { followLinks: false });
  
  await walker.on('file', function(root, stat, next) {
      // Add this file to the list of files
      files.push('http://localhost:8080/upLoads//publishedImages/' + stat.name);
      next();
  });
  
 await walker.on('end', function() {
      console.log(files);
      res.send(files)
  });
}
);

// app.get('/getPublishedImages', async (req, res) => {
//   console.log('here')
//   // console.log(req.body.array[0])
//   // let category=req.body[0];
//   console.log(req)
//   req.session.save(function(err) {
//     return Promise.resolve();
//   })
//   let event = new get('AllPictures')
//   let query='inner join AllEvents on AllPictures.EventId = AllEvents.Id where AllPictures.isPublished=1'
//   let ans = await event.findInnerJoin('PathImg, Category',`${query}`)
//   // console.log(`select PathImg from AllPictures ${query}'${category}'`)
 
 
//   if (ans.success){
//     console.log(ans.data)
//     res.send(ans.data)
//   }
//   else
//     res.send(undefined)
// })


app.get("/getAllPublishedFiles", controller.getAllPublishedFiles);
app.get('/getPublishedImages',controller.getAllPublishedFiles)
app.post('/sendMail', controller.mail);

app.post('/login', async (req, res) => {
  console.log(req.body)
  let u = new get('clients')
  let ans = await u.findOne(`username = '${req.body.username.trim()}' and UserPassword = '${req.body.password.trim()}' `)
  console.log(ans)
  if (!ans.success) {   
        res.status(500).send(ans.data);    
  }
  else {
    let sess = req.session;
    if (ans.data[0] != undefined){
    sess.username = ans.data[0].UserName
    sess.isAdmin = ans.data[0].IsAdmin
    sess.password = ans.data[0].UserPassword

    req.session.save(function (err) {
      return Promise.resolve();

    })

    res.send(ans.data[0])
  }
  else
  res.send(false)
}
})

app.get('/getAllCategories', async (req, res) => {
  let categories = new get('Categories')
  let ans = await categories.findAll('*')
  if (ans.success)
      res.send(ans.data)
  else
    res.send(undefined)
})

// app.get('/getAllCategoriesWithImages', async (req, res) => {
//   let cat = new get('Categories') ;
//   let query='Categories inner join AllEvents on Categories.Id = AllEvents.Category inner join AllPictures on AllPictures.EventId = AllEvents.Id where AllPictures.isPublished = 1 '
//   let ans = await cat.findInnerJoin('Categories.id, Categories.Name, AllPictures.PathImg',`${query}`)
//   if (ans.success)
//       res.send(ans.data)
//   else
//     res.send(undefined)
// })

app.use((req, res, next) => {
  let sess = req.session;
  if (sess.username != undefined) {
    // console.log(sess.username,'sess.username')       
    next()
  }
  else {
    console.log(sess, 'sess')
  }
})

app.post('/exit', async (req, res) => {
  console.log(req.session, 's1')
  req.session.destroy()
  console.log(req.session, 's2')
  res.send(true)
})

app.use('/uploads', ex.static('./upLoads'));

app.use('/api/client', my_client)

app.use('/api/admin', admin)
const PORT = (process.env.PORT || 8080);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
