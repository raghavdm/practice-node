let fs = require('fs')
let userdata = {
  dob: '',
  fname: '',
  lname: '',
  email: '',
  photo: '',
  mobile: '',
  address: '',
  surname: '',
  secretToken: ''
}

let userCtr = {
  create: function(req, res) {
    userdata.dob = req.body.dob;
    userdata.fname = req.body.fname;
    userdata.lname = req.body.lname;
    userdata.mobile = req.body.mobile;
    userdata.address = req.body.address;
    userdata.surname = req.body.surname;
    userdata.email = req.body.email.toLowerCase();

    var base64Data = req.body.photo.replace(/^data:image\/png;base64,/, "");

    fs.writeFile("./uploads/out.png", base64Data, 'base64', function(err) {
      if (err) {
        return res.send({
          status: 400,
          message: 'User data saved but not image'
        })
      }
      userdata.photo = "./uploads/out.png";
      return res.send({
        status: 200,
        message: 'User data saved'
      })
    });
  },

  login: function(req, res) {
    var email = req.body.email.toLowerCase();
    if(userdata.email == email) {
      let token = jwt.createSecretToken({
        'email': email
      });
      return res.send({
        data: token,
        status: 200,
        message: "User Login In"
      })
    } else {
      return res.send({
        status: 400,
        message: "User Not Exist"
      })
    }
  },
  
  profile: function(req, res) {
    return res.send({
      status: 200,
      result: userdata,
      message: "User Detail"
    })
  }
}

module.exports = userCtr