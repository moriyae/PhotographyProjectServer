var express = require('express');
var router = express.Router();
let my_fs = require('fs')
let get = require('../dal/getdata')
let add = require('../dal/adddata')


router.post('/login', async (req, res) => {
  let u = new get('clients')
  let ans = await u.findOne(`username = '${req.body.username.trim()}' and UserPassword = '${req.body.pass.trim()}' `)
  // console.log(ans) 
  // console.log(req.sessionID,'login')
  if (ans.name == 'ConnectionError') {
    // console.log('err:',ans,'end')
    res.status(500).send(ans);
  }
  else if (ans[0] == undefined) {

    res.send(false)

  }
  else {

    let sess = req.session;

    sess.username = ans[0].UserName
    sess.isAdmin = ans[0].IsAdmin
    sess.password = ans[0].UserPassword

    req.session.save(function (err) {
      return Promise.resolve();

    })

    res.send(ans[0])
  }
})
router.post('/login/exit', async (req, res) => {
  console.log(req.session, 's1')
  req.session.destroy()
  console.log(req.session, 's2')
  res.send(true)
})