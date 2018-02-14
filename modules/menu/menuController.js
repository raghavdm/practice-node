let fs = require('fs')
let im = require('imagemagick');
let MenuModel = require('./menuModel')

let menuCtr = {
  create: function(req, res) {
    let menuData = {
      name: req.body.name,
      price: req.body.price,
      userId: req.body.userId,
      categoryId: req.body.categoryId
    }
    let menu = new MenuModel(menuData)
    menu.save(function(err) {
      if (!err) {
        let oldPath = req.files.image.path
        let fileExt = req.files.image.name.split('.').pop()
        let newPath = process.env.PWD + '/uploads/' + menu._id + '.' + fileExt
        let smallPath = process.env.PWD + '/uploads/' + menu._id + '-small.' + fileExt
        let imageUrl = 'uploads/' + menu._id + '.' + fileExt
        fs.readFile(oldPath, function(err, data) {
          fs.writeFile(newPath, data, function(err) {
            if (!err) {
              im.resize({
                srcPath: newPath,
                dstPath: newPath,
                width: 200
              }, function(err, stdout, stderr) {});

              MenuModel.findOneAndUpdate({
                _id: menu._id
              }, {
                image: imageUrl
              }, function(err) {
                if (!err) {
                  menu.image = imageUrl
                  return res.send({
                    status: 200,
                    menu: menu,
                    message: req.t('MENU_SUCCESS')
                  })
                } else {
                  return res.send({
                    status: 400,
                    message: req.t('MENU_IMAGE_ERROR')
                  })
                }
              })
            } else {
              return res.send({
                status: 400,
                message: req.t('MENU_IMAGE_ERROR')
              })
            }
          })
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('MENU_NOT_CREATED')
        })
      }
    })
  },

  getMenu: function(req, res) {
    MenuModel.findOne({
      _id: req.query.menuId
    }, function(err, menu) {
      if (menu) {
        return res.send({
          status: 200,
          menu: menu,
          message: req.t('SUCCESS')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('MENU_NOT_FOUND')
        })
      }
    })
  },

  edit: function(req, res) {
    MenuModel.findOneAndUpdate({
      _id: req.body.menuId
    }, {
      name: req.body.name,
      price: req.body.price,
      userId: req.body.userId,
      categoryId: req.body.categoryId
    }, {
      new: true
    }, function(err, menu) {
      if (!err) {
        if (req.files.image != undefined) {
          let oldPath = req.files.image.path
          let fileExt = req.files.image.name.split('.').pop()
          let newPath = process.env.PWD + '/uploads/' + menu._id + '.' + fileExt
          let imageUrl = 'uploads/' + menu._id + '.' + fileExt
          fs.readFile(oldPath, function(err, data) {
            fs.writeFile(newPath, data, function(err) {
              if (!err) {
                im.resize({
                  srcPath: newPath,
                  dstPath: newPath,
                  width: 200
                }, function(err, stdout, stderr) {});

                MenuModel.findOneAndUpdate({
                  _id: menu._id
                }, {
                  image: imageUrl
                }, function(err) {
                  if (!err) {
                    menu.image = imageUrl
                    return res.send({
                      status: 200,
                      message: req.t('MENU_UPDATE')
                    })
                  } else {
                    return res.send({
                      status: 400,
                      message: req.t('MENU_IMAGE_ERROR')
                    })
                  }
                })
              } else {
                return res.send({
                  status: 400,
                  message: req.t('MENU_IMAGE_ERROR')
                })
              }
            })
          })
        } else {
          return res.send({
            status: 200,
            message: req.t('MENU_UPDATE')
          })
        }
      } else {
        return res.send({
          status: 400,
          message: req.t('MENU_NOT_FOUND')
        })
      }
    })
  },

  delete: function(req, res) {
    MenuModel.remove({
      _id: req.body.menuId
    }, function(err, menu) {
      if (!err) {
        return res.send({
          status: 200,
          message: req.t('MENU_DELETE')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('MENU_NOT_FOUND')
        })
      }
    })
  },

  list: function(req, res) {
    MenuModel.find({
      userId: req.query.userId,
      categoryId: req.query.categoryId === 'all' ? { $ne: null } : req.query.categoryId
    }).sort({
      createdAt: -1
    }).populate('categoryId').skip(+process.env.ADMIN_LIMIT * req.query.page).limit(+process.env.ADMIN_LIMIT)

    .then(function(menu) {
      if (menu.length > 0) {
        return res.send({
          status: 200,
          menu: menu,
          message: req.t('SUCCESS')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('MENU_NOT_FOUND')
        })
      }
    })
  },

  search: function(req, res) {
    let regex = /^[a-z0-9]+$/i
    if (!req.query.name.match(regex)) {
      return res.send({
        status: 400,
        message: req.t('MENU_NOT_FOUND')
      })
    }
    MenuModel.find({
      userId: req.query.userId,
      name: new RegExp(req.query.name, 'i'),
      categoryId: req.query.categoryId === 'all' ? { $ne: null } : req.query.categoryId
    }).populate('categoryId').sort({ createdAt: -1 })

    .then(function(menu) {
      if (menu.length > 0) {
        return res.send({
          status: 200,
          menu: menu,
          message: req.t('SUCCESS')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('MENU_NOT_FOUND')
        })
      }
    })
  }
}

module.exports = menuCtr