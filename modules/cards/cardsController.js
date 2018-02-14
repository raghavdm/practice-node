let jwt = require('../../helper/jwt')
let utils = require('../../helper/utils')
let cardsUtil = require('./cardsHelper')
let CardsModel = require('./cardsModel')
let AdminModel = require('../admin/adminModel')
let CardsConsModel = require('./cardsConsModel')
let CashierModel = require('../cashier/cashierModel')
let TransactionModel = require('../transactions/transactionModel')
let TransactionLogModel = require('../transactions/transactionLogModel')
let _ = require('lodash')
let mongoose = require('mongoose')
let momenttz = require('moment-timezone')
let moment = require('moment')

const TOPUP = 'topup'
const BLOCK = 'block'
const REFUND = 'refund'
const EXPIRED = 'expired'
const ALLOCATE = 'allocate'
const FACEVALUE = 'facevalue'
const CONSOLIDATE = 'consolidate'

let cardsCtr = {
  allocate: function(req, res) {
    let authToken = jwt.decodeToken(req.headers['x-auth-token'])
    CardsModel.findOne({
      rfidCardId: req.body.rfidCardId
    }).then(function(cardsDet) {
      AdminModel.find({}).then(function(adminData) {
        if (cardsDet) {
          if (cardsDet.status === ALLOCATE || cardsDet.status === TOPUP || cardsDet.status === CONSOLIDATE) {
            return res.send({
              status: 400,
              message: req.t('CARD_NOT_ALLOCATE')
            })
          }
          CashierModel.findOne({ _id: authToken.userId }).populate('counter').then(function(cashier) {
            if (cashier.cardsAllocate == 0 && !req.body.saturity) {
              return res.send({
                status: 400,
                message: "You dont have enough cards, please ask Admin for more."
              })
            }
            let currCounter = (utils.empty(cashier.counter.name) ? 1 : cashier.counter.name)
            cardsCtr.removeTransaction(req.body.rfidCardId)
            let transObj = {
              cashierId: authToken.userId,
              rfidCardId: req.body.rfidCardId,
              type: req.body.saturity ? 'saturity' : ALLOCATE,
              paymentMode: req.body.paymentMode,
              payment: req.body.paymentMode == 'cash' ? 'cash' : req.body.paymentMode == 'paytm' ? 'paytm' : 'card',
              amount: req.body.saturity ? req.body.balance : req.body.balance - adminData[0].faceValue,
              counter: currCounter,
              createdAt: new Date()
            }
            cardsCtr.saveTransaction(transObj)
            CardsModel.findOneAndUpdate({
              rfidCardId: req.body.rfidCardId
            }, {
              status: req.body.saturity ? 'saturity' : ALLOCATE,
              userId: authToken.userId,
              faceValue: req.body.saturity ? 0 : adminData[0].faceValue,
              balance: req.body.saturity ? req.body.balance + cardsDet.balance : req.body.balance - adminData[0].faceValue,
              paymentMode: req.body.paymentMode,
              validity: req.body.validity,
              counter: currCounter,
              createdAt: new Date()
            }, {
              new: true
            }, function(err, cardDet) {
              if (!err) {
                if (!req.body.saturity) {
                  let transObjs = {
                    cashierId: authToken.userId,
                    rfidCardId: req.body.rfidCardId,
                    type: FACEVALUE,
                    paymentMode: req.body.paymentMode,
                    payment: req.body.paymentMode == 'cash' ? 'cash' : req.body.paymentMode == 'paytm' ? 'paytm' : 'card',
                    amount: adminData[0].faceValue,
                    counter: currCounter,
                    createdAt: new Date()
                  }
                  cardsCtr.saveTransaction(transObjs)

                  CashierModel.findOneAndUpdate({
                    _id: authToken.userId
                  }, {
                    $inc: { cardsAllocate: -1 }
                  }, {
                    new: true
                  }, function(err, cashierUpdate) {
                    return res.send({
                      status: 200,
                      cardBalance: cardDet.balance,
                      message: req.t('CARD_SUCCESS'),
                      rfidCardId: req.body.rfidCardId,
                      cardFaceValue: adminData[0].faceValue,
                      cashierCards: cashierUpdate.cardsAllocate,
                      createdAt: momenttz.tz(new Date(), process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
                    })
                  })
                } else {
                  return res.send({
                    status: 200,
                    cardBalance: cardDet.balance,
                    message: req.t('CARD_SUCCESS'),
                    rfidCardId: req.body.rfidCardId,
                    cardFaceValue: adminData[0].faceValue,
                    cashierCards: cashier.cardsAllocate,
                    createdAt: momenttz.tz(new Date(), process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
                  })
                }
              } else {
                return res.send({
                  status: 400,
                  message: req.t('CARD_NOT_ALLOCATE')
                })
              }
            })
          }).catch(function(err) {
            console.log(err)
          })
        } else {
          CashierModel.findOne({ _id: authToken.userId }).populate('counter').then(function(cashier) {
            if (cashier.cardsAllocate == 0 && !req.body.saturity) {
              return res.send({
                status: 400,
                message: "You dont have enough cards, please ask Admin for more."
              })
            }
            let currCounter = (utils.empty(cashier.counter.name) ? 1 : cashier.counter.name)
            let transObj = {
              cashierId: authToken.userId,
              rfidCardId: req.body.rfidCardId,
              type: req.body.saturity ? 'saturity' : ALLOCATE,
              paymentMode: req.body.paymentMode,
              payment: req.body.paymentMode == 'cash' ? 'cash' : req.body.paymentMode == 'paytm' ? 'paytm' : 'card',
              amount: req.body.saturity ? req.body.balance : req.body.balance - adminData[0].faceValue,
              counter: currCounter,
              createdAt: new Date()
            }
            cardsCtr.saveTransaction(transObj)

            let cardsData = {
              status: req.body.saturity ? 'saturity' : ALLOCATE,
              userId: authToken.userId,
              faceValue: adminData[0].faceValue,
              balance: req.body.saturity ? req.body.balance : req.body.balance - adminData[0].faceValue,
              rfidCardId: req.body.rfidCardId,
              counter: currCounter,
              paymentMode: req.body.paymentMode,
              validity: req.body.validity,
              createdAt: new Date()
            }
            let cards = new CardsModel(cardsData)

            cards.save(function(err) {
              if (!err) {
                if (!req.body.saturity) {
                  let transObjs = {
                    cashierId: authToken.userId,
                    rfidCardId: req.body.rfidCardId,
                    type: FACEVALUE,
                    paymentMode: req.body.paymentMode,
                    payment: req.body.paymentMode == 'cash' ? 'cash' : req.body.paymentMode == 'paytm' ? 'paytm' : 'card',
                    amount: adminData[0].faceValue,
                    counter: currCounter,
                    createdAt: new Date()
                  }
                  cardsCtr.saveTransaction(transObjs)

                  CashierModel.findOneAndUpdate({
                    _id: authToken.userId
                  }, {
                    $inc: { cardsAllocate: -1 }
                  }, {
                    new: true
                  }, function(err, cashierUpdate) {
                    return res.send({
                      status: 200,
                      cardBalance: cards.balance,
                      message: req.t('CARD_SUCCESS'),
                      rfidCardId: req.body.rfidCardId,
                      cardFaceValue: adminData[0].faceValue,
                      cashierCards: cashierUpdate.cardsAllocate,
                      createdAt: momenttz.tz(new Date(), process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
                    })
                  })
                } else {
                  return res.send({
                    status: 200,
                    cardBalance: cards.balance,
                    message: req.t('CARD_SUCCESS'),
                    rfidCardId: req.body.rfidCardId,
                    cardFaceValue: adminData[0].faceValue,
                    cashierCards: cashier.cardsAllocate,
                    createdAt: momenttz.tz(new Date(), process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
                  })
                }
              } else {
                return res.send({
                  status: 400,
                  message: req.t('CARD_NOT_ALLOCATE')
                })
              }
            })
          }).catch(function(err) {
            console.log(err)
          })
        }
      })
    })
  },

  block: function(req, res) {
    let authToken = jwt.decodeToken(req.headers['x-auth-token'])
    CardsModel.findOneAndUpdate({
      rfidCardId: req.body.rfidCardId
    }, {
      status: BLOCK
    }, {
      new: true
    }, function(err, cards) {
      if (!err) {
        let transObj = {
          cashierId: authToken.userId,
          rfidCardId: req.body.rfidCardId,
          counter: cards.counter,
          type: BLOCK,
          createdAt: new Date()
        }
        cardsCtr.saveTransaction(transObj)
        res.json({
          status: 200,
          cards: cards,
          message: req.t('CARD_BLOCK_SUCCESS')
        })
      } else {
        res.json({
          status: 400,
          message: req.t('CARD_NOT_FOUND')
        })
      }
    })
  },

  checkBalance: function(req, res) {
    CardsModel.findOne({
      rfidCardId: req.body.rfidCardId
    }).then(function(cards) {
      if (cards) {
        let cardsDet = cardsUtil.cardsDetail(cards, ['balance', 'rfidCardId', 'validity', 'paymentMode', 'faceValue', 'status', 'createdAt'])
        if (cardsDet.status === BLOCK || cardsDet.status === REFUND || cardsDet.status === EXPIRED) {
          return res.send({
            status: 400,
            message: 'Card is ' + cardsDet.status
          })
        } else {
          cardsDet.createdAt = momenttz.tz(cardsDet.createdAt, process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
          return res.send({
            status: 200,
            cards: cardsDet,
            message: req.t('SUCCESS')
          })
        }
      } else {
        return res.send({
          status: 400,
          message: req.t('CARD_NOT_FOUND')
        })
      }
    })
  },

  returnBalance: function(req, res) {
    let authToken = jwt.decodeToken(req.headers['x-auth-token'])
    TransactionModel.findOne({
      paymentMode: {
        $ne: 'cash'
      },
      rfidCardId: req.body.rfidCardId
    }).then(function(cardsTrans) {
      CardsModel.findOne({
        rfidCardId: req.body.rfidCardId
      }).then(function(cards) {
        if (cardsTrans && !req.body.allow && cards.balance > 0) {
          return res.json({
            status: 400,
            message: "Not Allow to refund Card as A Transaction done on this card is through Debit/Credit Card"
          })
        } else {
          if (cards) {
            if (cards.status === BLOCK || cards.status === EXPIRED || cards.status === REFUND) {
              return res.json({
                status: 400,
                message: 'Card is ' + cards.status
              })
            }
            if (cards.status == 'saturity') {
              return res.json({
                status: 400,
                message: "Not Allow to refund Saturity Card"
              })
            }
            CashierModel.findOneAndUpdate({
              _id: authToken.userId
            }, {
              $inc: { cardsAllocate: 1 }
            }, {
              new: true
            }, function(err, cashierUpdate) {
              CardsModel.findOneAndUpdate({
                rfidCardId: req.body.rfidCardId
              }, {
                status: REFUND,
                createdAt: new Date(),
                $inc: { balance: -req.body.balance }
              }, {
                new: true
              }, function(err, cards) {
                if (cards) {
                  let transObj = {
                    cashierId: authToken.userId,
                    rfidCardId: req.body.rfidCardId,
                    type: REFUND,
                    paymentMode: 'debit',
                    payment: 'cash',
                    amount: req.body.balance,
                    counter: cards.counter,
                    createdAt: Date.now()
                  }
                  cardsCtr.saveTransaction(transObj)
                  let cardRef = {
                    _id: cards._id,
                    status: cards.status,
                    userId: cards.userId,
                    balance: cards.balance,
                    rfidCardId: cards.rfidCardId,
                    counter: cards.counter,
                    paymentMode: cards.paymentMode,
                    validity: cards.validity,
                    createdAt: momenttz.tz(new Date(), process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
                  }
                  res.json({
                    status: 200,
                    cards: cardRef,
                    message: req.t('CARD_REFUND')
                  })
                }
              })
            })
          } else {
            return res.send({
              status: 400,
              message: req.t('CARD_NOT_FOUND')
            })
          }
        }
      });
    }).catch(function(err) {
      console.log(err);
    });
  },

  topup: function(req, res) {
    let authToken = jwt.decodeToken(req.headers['x-auth-token'])
    CashierModel.findOne({ _id: authToken.userId }).populate('counter')
      .then(function(cashier) {
        let currCounter = (utils.empty(cashier.counter.name) ? 1 : cashier.counter.name)
        CardsModel.findOne({
          rfidCardId: req.body.rfidCardId,
          $or: [{
            status: BLOCK
          }, {
            status: REFUND
          }, {
            status: EXPIRED
          }, {
            status: 'saturity'
          }]
        }).then(function(card) {
          if (card) {
            if (card.status == 'saturity') {
              return res.json({
                status: 400,
                message: "Not Allow to topup Saturity Card"
              })
            }
            return res.json({
              status: 400,
              message: 'Card is ' + card.status
            })
          } else {
            CardsModel.findOneAndUpdate({
              rfidCardId: req.body.rfidCardId
            }, {
              $inc: { balance: req.body.balance },
              counter: currCounter,
              paymentMode: req.body.paymentMode,
              status: TOPUP,
              createdAt: new Date()
            }, {
              new: true
            }, function(err, cards) {
              if (cards) {
                let transObj = {
                  amount: req.body.balance,
                  createdAt: new Date(),
                  counter: currCounter,
                  rfidCardId: req.body.rfidCardId,
                  cashierId: authToken.userId,
                  payment: req.body.paymentMode == 'cash' ? 'cash' : req.body.paymentMode == 'paytm' ? 'paytm' : 'card',
                  paymentMode: req.body.paymentMode,
                  type: TOPUP,
                }
                cardsCtr.saveTransaction(transObj)
                let cardTop = {
                  _id: cards._id,
                  status: cards.status,
                  userId: cards.userId,
                  counter: cards.counter,
                  balance: cards.balance,
                  validity: cards.validity,
                  rfidCardId: cards.rfidCardId,
                  paymentMode: cards.paymentMode,
                  createdAt: momenttz.tz(new Date(), process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
                }
                res.json({
                  status: 200,
                  cards: cardTop,
                  message: req.t('CARD_TOPUP')
                })
              } else {
                res.json({
                  status: 400,
                  message: req.t('CARD_NOT_FOUND')
                })
              }
            })
          }
        }).catch(function(err) {
          console.log(err)
        })
      })

    .catch(function(err) {
      console.log(err)
    })
  },

  cardsDetail: function(req, res) {
    TransactionLogModel.find({
      cashierId: !req.query.userId ? { $ne: null } : req.query.userId,
      createdAt: !req.query.from ? { $ne: null } : { $gte: req.query.from, $lte: req.query.to },
      payment: !req.query.paymentMode || req.query.paymentMode == 'refund' || req.query.paymentMode == 'reversed' || req.query.paymentMode == 'saturity' ? { $ne: null } : req.query.paymentMode,
      type: req.query.paymentMode != 'refund' && req.query.paymentMode != 'reversed' && req.query.paymentMode != 'saturity' ? { $ne: null } : req.query.paymentMode == 'reversed' ? 'reversed' : req.query.paymentMode == 'saturity' ? 'saturity' : 'refund',
    }).sort({
      createdAt: -1
    }).populate('cashierId', 'cashierName').skip(req.query.page != 'all' ? +process.env.ADMIN_LIMIT * req.query.page : 0).limit(req.query.sorting != '' || req.query.page == 'all' ? +process.env.SORTING_LIMIT : +process.env.ADMIN_LIMIT)

    .then(function(cards) {
      if (cards.length > 0) {
        if (!req.query.sorting) {
          return res.send({
            status: 200,
            cards: cards,
            message: req.t('SUCCESS')
          })
        } else {
          if (req.query.sorting == 'daily') {
            let cardsDaily = [];
            let cardsDate = false;
            let k = 0;
            for (i = 0; i < cards.length; i++) {
              for (j = 0; j < cardsDaily.length; j++) {
                if (cardsDaily[j].date == moment(cards[i].createdAt).format('dddd, MMMM DD YYYY')) {
                  cardsDate = true;
                  if (req.query.paymentMode != 'refund') {
                    if (cards[i].type != 'reversed') {
                      if (cards[i].paymentMode == 'debit') {
                        cardsDaily[j].amount = cardsDaily[j].amount - cards[i].amount;
                      } else {
                        cardsDaily[j].amount += cards[i].amount;
                      }
                    }
                  } else {
                    cardsDaily[j].amount += cards[i].amount;
                  }
                } else if (j == cardsDaily.length - 1 && cardsDate) {
                  cardsDate = false;
                }
              }
              if (cardsDate == false) {
                cardsDaily[k] = {};
                cardsDaily[k].date = moment(cards[i].createdAt).format('dddd, MMMM DD YYYY')
                cardsDaily[k].amount = 0;
                if (req.query.paymentMode != 'refund') {
                  if (cards[i].type != 'reversed') {
                    if (cards[i].paymentMode == 'debit') {
                      cardsDaily[k].amount = cardsDaily[k].amount - cards[i].amount;
                    } else {
                      cardsDaily[k].amount += cards[i].amount;
                    }
                  }
                } else {
                  cardsDaily[k].amount += cards[i].amount;
                }
                if (req.query.userId != '') {
                  cardsDaily[k].cashierName = cards[i].cashierId.cashierName;
                }
                k++;
              }
            }
            res.send({
              status: 200,
              cards: cardsDaily,
              message: req.t('SUCCESS')
            })
          } else if (req.query.sorting == 'month') {
            let cardsDaily = [];
            let cardsDate = false;
            let k = 0;
            for (i = 0; i < cards.length; i++) {
              for (j = 0; j < cardsDaily.length; j++) {
                if (cardsDaily[j].date == moment(cards[i].createdAt).format('MMMM YYYY')) {
                  cardsDate = true;
                  if (req.query.paymentMode != 'refund') {
                    if (cards[i].type != 'reversed') {
                      if (cards[i].paymentMode == 'debit') {
                        cardsDaily[j].amount = cardsDaily[j].amount - cards[i].amount;
                      } else {
                        cardsDaily[j].amount += cards[i].amount;
                      }
                    }
                  } else {
                    cardsDaily[j].amount += cards[i].amount;
                  }
                } else if (j == cardsDaily.length - 1 && cardsDate) {
                  cardsDate = false;
                }
              }
              if (cardsDate == false) {
                cardsDaily[k] = {};
                cardsDaily[k].date = moment(cards[i].createdAt).format('MMMM YYYY')
                cardsDaily[k].amount = 0;
                if (req.query.paymentMode != 'refund') {
                  if (cards[i].type != 'reversed') {
                    if (cards[i].paymentMode == 'debit') {
                      cardsDaily[k].amount = cardsDaily[k].amount - cards[i].amount;
                    } else {
                      cardsDaily[k].amount += cards[i].amount;
                    }
                  }
                } else {
                  cardsDaily[k].amount += cards[i].amount;
                }
                if (req.query.userId != '') {
                  cardsDaily[k].cashierName = cards[i].cashierId.cashierName;
                }
                k++;
              }
            }
            res.send({
              status: 200,
              cards: cardsDaily,
              message: req.t('SUCCESS')
            })
          }
        }
      } else {
        return res.send({
          status: 400,
          message: req.t('CARD_NOT_FOUND')
        })
      }
    })
  },

  consolidate: function(req, res) {
    let authToken = jwt.decodeToken(req.headers['x-auth-token'])
    CashierModel.findOne({ _id: authToken.userId }).then(function(cashierCards) {
      if (cashierCards.cardsAllocate == 0) {
        return res.send({
          status: 400,
          message: "You dont have enough cards, please ask Admin for more."
        })
      }
      CardsModel.findOne({
        rfidCardId: req.body.rfidCardIdNew
      }, function(err, cardsFind) {
        if (cardsFind) {
          res.send({
            status: 400,
            message: 'You cannot consolidate card with this number'
          })
        } else {
          AdminModel.find({}).then(function(adminData) {
            CardsModel.findOneAndUpdate({
              rfidCardId: req.body.rfidCardId,
            }, {
              createdAt: new Date(),
              faceValue: adminData[0].faceValue,
              validity: req.body.validity,
              rfidCardId: req.body.rfidCardIdNew,
              $inc: { balance: req.body.balance > 0 ? req.body.balance - adminData[0].faceValue : adminData[0].faceValue }
            }, {
              new: true
            }, function(err, cardsUpdate) {
              if (!err) {
                CashierModel.findOne({ _id: authToken.userId }).populate('counter').then(function(cashier) {
                  let currCounter = (utils.empty(cashier.counter.name) ? 1 : cashier.counter.name)
                  let cardsConsData = {
                    createdAt: new Date(),
                    rfidCardId: req.body.rfidCardId,
                    rfidCardIdNew: req.body.rfidCardIdNew
                  }
                  let cardsCons = new CardsConsModel(cardsConsData)
                  cardsCons.save()

                  TransactionModel.update({
                    rfidCardId: req.body.rfidCardId,
                  }, {
                    rfidCardId: req.body.rfidCardIdNew
                  }, {
                    multi: true
                  }, function(err) {
                    TransactionLogModel.update({
                      rfidCardId: req.body.rfidCardId,
                    }, {
                      rfidCardId: req.body.rfidCardIdNew
                    }, {
                      multi: true
                    }, function(err) {
                      let transObjss = {
                        cashierId: authToken.userId,
                        rfidCardId: req.body.rfidCardIdNew,
                        type: CONSOLIDATE,
                        paymentMode: req.body.paymentMode,
                        payment: req.body.paymentMode == 'cash' ? 'cash' : req.body.paymentMode == 'paytm' ? 'paytm' : 'card',
                        amount: req.body.balance > 0 ? req.body.balance - adminData[0].faceValue : 0,
                        counter: currCounter,
                        createdAt: new Date()
                      }
                      cardsCtr.saveTransaction(transObjss)

                      let transObjs = {
                        cashierId: authToken.userId,
                        rfidCardId: req.body.rfidCardIdNew,
                        type: FACEVALUE,
                        paymentMode: req.body.paymentMode,
                        payment: req.body.paymentMode == 'cash' ? 'cash' : req.body.paymentMode == 'paytm' ? 'paytm' : 'card',
                        amount: adminData[0].faceValue,
                        counter: currCounter,
                        createdAt: new Date()
                      }
                      cardsCtr.saveTransaction(transObjs)

                      CashierModel.findOneAndUpdate({
                        _id: authToken.userId
                      }, {
                        $inc: { cardsAllocate: -1 }
                      }, {
                        new: true
                      }, function(err, cashierUpdate) {
                        res.send({
                          status: 200,
                          balance: cardsUpdate.balance,
                          rfidCardId: req.body.rfidCardId,
                          message: req.t('CARD_CONSOLIDATE'),
                          cardFaceValue: adminData[0].faceValue,
                          rfidCardIdNew: req.body.rfidCardIdNew,
                          cashierCards: cashierUpdate.cardsAllocate,
                          createdAt: momenttz.tz(new Date(), process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
                        })
                      })
                    })
                  })
                })
              } else {
                res.send({
                  status: 400,
                  message: req.t('CARD_NOT_FOUND')
                })
              }
            })
          })
        }
      })
    })
  },

  reversedTrans: function(req, res) {
    CardsModel.findOneAndUpdate({
      rfidCardId: req.body.rfidCardId
    }, {
      $inc: { balance: -req.body.balance }
    }, {
      new: true
    }, function(err, cardsFind) {
      if (!err) {
        TransactionLogModel.findOneAndUpdate({
          _id: req.body.cardTranId
        }, {
          type: 'reversed',
          reverseText: req.body.reverseText
        }, {
          new: true
        }, function(err, cardsTrans) {
          if (!err) {
            res.send({
              status: 200,
              message: req.t('SUCCESS')
            })
          } else {
            res.send({
              status: 400,
              message: req.t('CARD_NOT_FOUND')
            })
          }
        });
      } else {
        res.send({
          status: 400,
          message: req.t('CARD_NOT_FOUND')
        })
      }
    })
  },

  cardsList: function(req, res) {
    CardsModel.find({
      status: {
        $ne: 'refund'
      },
      createdAt: !req.query.from ? { $ne: null } : { $gte: req.query.from, $lte: req.query.to }
    }).sort({
      createdAt: -1
    }).skip(req.query.page != 'all' ? +process.env.ADMIN_LIMIT * req.query.page : 0).limit(req.query.sorting != '' || req.query.page == 'all' ? +process.env.SORTING_LIMIT : +process.env.ADMIN_LIMIT)

    .then(function(cards) {
      if (cards) {
        if (!req.query.sorting) {
          return res.send({
            status: 200,
            cards: cards,
            message: req.t('SUCCESS')
          })
        } else {
          if (req.query.sorting == 'daily') {
            let cardsDaily = [];
            let cardsDate = false;
            let k = 0;
            for (i = 0; i < cards.length; i++) {
              for (j = 0; j < cardsDaily.length; j++) {
                if (cardsDaily[j].createdAt == moment(cards[i].createdAt).format('dddd, MMMM DD YYYY')) {
                  cardsDate = true;
                  if (cards[i].paymentMode == 'refund') {
                    cardsDaily[j].balance = cardsDaily[j].balance - cards[i].balance;
                  } else {
                    cardsDaily[j].balance += cards[i].balance;
                  }
                } else if (j == cardsDaily.length - 1 && cardsDate) {
                  cardsDate = false;
                }
              }
              if (cardsDate == false) {
                cardsDaily[k] = {};
                cardsDaily[k].createdAt = moment(cards[i].createdAt).format('dddd, MMMM DD YYYY')
                cardsDaily[k].balance = 0;
                if (cards[i].paymentMode == 'refund') {
                  cardsDaily[k].balance = cardsDaily[k].balance - cards[i].balance;
                } else {
                  cardsDaily[k].balance += cards[i].balance;
                }
                k++;
              }
            }
            res.send({
              status: 200,
              cards: cardsDaily,
              message: req.t('SUCCESS')
            })
          } else if (req.query.sorting == 'month') {
            let cardsDaily = [];
            let cardsDate = false;
            let k = 0;
            for (i = 0; i < cards.length; i++) {
              for (j = 0; j < cardsDaily.length; j++) {
                if (cardsDaily[j].createdAt == moment(cards[i].createdAt).format('MMMM YYYY')) {
                  cardsDate = true;
                  if (cards[i].paymentMode == 'refund') {
                    cardsDaily[j].balance = cardsDaily[j].balance - cards[i].balance;
                  } else {
                    cardsDaily[j].balance += cards[i].balance;
                  }
                } else if (j == cardsDaily.length - 1 && cardsDate) {
                  cardsDate = false;
                }
              }
              if (cardsDate == false) {
                cardsDaily[k] = {};
                cardsDaily[k].createdAt = moment(cards[i].createdAt).format('MMMM YYYY')
                cardsDaily[k].balance = 0;
                if (cards[i].paymentMode == 'refund') {
                  cardsDaily[k].balance = cardsDaily[k].balance - cards[i].balance;
                } else {
                  cardsDaily[k].balance += cards[i].balance;
                }
                k++;
              }
            }
            res.send({
              status: 200,
              cards: cardsDaily,
              message: req.t('SUCCESS')
            })
          }
        }
      } else {
        res.send({
          status: 400,
          message: req.t('CARD_NOT_FOUND')
        })
      }
    }).catch(function(err) {
      console.log(err);
    })
  }
}

cardsCtr.cardHistory = function(req, res, next) {
  let resData = {}
  CardsModel.findOne({
    rfidCardId: req.query.rfidCardId
  }, function(err, cardsFind) {
    TransactionModel.find({
      rfidCardId: _.toString(req.query.rfidCardId)
    }).sort({
      createdAt: -1
    }).populate('truckId').populate('orderId')

    .then(function(cards) {
      if (utils.empty(cards)) {
        resData = {
          'status': 400,
          'message': 'No record found'
        }
      } else {
        resData = {
          status: 200,
          history: [],
          message: req.t('SUCCESS'),
          totalAmount: cardsFind.balance
        }
        _(cards).forEach(function(card) {
          if (card.type === 'order') {
            let totalOrderAmount = 0;
            _(card.orderId.orderItems).forEach(function(product) {
              totalOrderAmount += _.toInteger(product.productPrice) * _.toInteger(product.productQuantity);
            })
            resData.history.push({
              date: momenttz.tz(card.createdAt, process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
              entryType: 'debit',
              truckName: card.truckId.truckName,
              orderItems: card.orderId.orderItems,
              amount: totalOrderAmount
            })
          } else {
            let entryType
            if (card.type === REFUND) {
              entryType = REFUND
            } else if (card.type === BLOCK) {
              entryType = BLOCK
            } else {
              entryType = 'credit'
            }
            resData.history.push({
              date: momenttz.tz(card.createdAt, process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
              entryType: entryType,
              counter: card.counter,
              amount: card.amount
            })
          }
        })
      }
      res.json(resData)
    }).catch(function(err) {
      next(err)
    })
  })
}

cardsCtr.activeList = function(req, res, next) {
  CardsModel.find({ rfidCardId: { $regex: '.*' + req.query.rfidCardId + '.*' }, $or: [{ status: ALLOCATE }, { status: TOPUP }] }).sort({ createdAt: -1 })
    .skip(+process.env.APP_LIMIT * req.query.page).limit(+process.env.APP_LIMIT)
    .then(function(cards) {
      let resData = {}
      if (utils.empty(cards)) {
        resData = {
          status: 400,
          message: 'NO_RECORD_FOUND'
        }
      } else {
        let cardData = []
        _(cards).forEach(function(card) {
          cardData.push({
            _id: card._id,
            userId: card.userId,
            balance: card.balance,
            rfidCardId: card.rfidCardId,
            paymentMode: card.paymentMode,
            validity: card.validity,
            createdAt: momenttz.tz(card.createdAt, process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
            status: card.status
          })
        })
        resData = {
          status: 200,
          message: 'SUCCESS',
          cards: cardData
        }
      }
      res.json(resData)
    })
    .catch(function(err) {
      next(err)
    })
}

cardsCtr.dailyReports = function(req, res, next) {
  let authToken = jwt.decodeToken(req.headers['x-auth-token'])
  let condition = {}
  CardsModel.find({}, { rfidCardId: 1, _id: 0 })
    .then(function(cards) {
      if (utils.empty(cards)) {
        res.json({
          status: 400,
          message: 'Record not found'
        })
      } else {
        let allCards = []
        _(cards).forEach(function(card) {
          allCards.push(card.rfidCardId)
        })
        let date = new Date()
        let from = []
        let to = []
        if (!utils.empty(req.query.status)) {
          let status = _.split(req.query.status, ',')
          condition = _.extend(condition, { $and: [{ type: { $ne: 'order' } }, { type: { $in: status } }] })
        } else {
          condition = _.extend(condition, { type: { $ne: 'order' } })
        }
        if (!utils.empty(req.query.paymentMode)) {
          let paymentMode = _.split(req.query.paymentMode, ',')
          condition = _.extend(condition, { payment: { $in: paymentMode } })
        }
        if (utils.empty(req.query.from) || utils.empty(req.query.to)) {
          from[0] = 0
          from[1] = 0
          to[0] = 23
          to[1] = 59
        } else {
          from = _.split(req.query.from, ':')
          to = _.split(req.query.to, ':')
        }
        let fromDate = new Date(moment(moment().date(date.getDate()).month(date.getMonth()).year(date.getFullYear()).hours(from[0]).minutes(from[1]).second(0)).utc())
        let toDate = new Date(moment(moment().date(date.getDate()).month(date.getMonth()).year(date.getFullYear()).hours(to[0]).minutes(to[1]).second(59)).utc())
        condition = _.extend(condition, { createdAt: { $gte: fromDate, $lte: toDate } })
        condition = _.extend(condition, { rfidCardId: { $in: allCards } })
        condition = _.extend(condition, { cashierId: authToken.userId })
        return TransactionLogModel.find(condition).skip(+process.env.APP_LIMIT * req.query.page).limit(+process.env.APP_LIMIT).sort({ createdAt: -1 })
      }
    })
    .then(function(reports) {
      if (utils.empty(reports)) {
        res.json({
          status: 400,
          message: 'Record not found'
        })
      } else {
        TransactionLogModel.find(condition)
          .then(function(allReports) {
            let totalAmount = 0
            let resData = []
            _(allReports).forEach(function(singleReport) {
              if (singleReport.type !== BLOCK || singleReport.type !== 'order') {
                if (singleReport.paymentMode === 'credit' || singleReport.paymentMode === 'cash' || singleReport.paymentMode === 'paytm') {
                  totalAmount = totalAmount + _.toInteger(singleReport.amount)
                }
                if (singleReport.paymentMode === 'debit' || singleReport.type === REFUND) {
                  totalAmount = totalAmount - _.toInteger(singleReport.amount)
                }
              }
            })
            _(reports).forEach(function(report) {
              resData.push({
                _id: report._id,
                rfidCardId: report.rfidCardId,
                status: report.type,
                createdAt: momenttz.tz(report.createdAt, process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
                amount: report.amount,
                paymentMode: report.payment,
                counter: report.counter
              })
            })
            res.json({
              status: 200,
              message: req.t('SUCCESS'),
              totalAmount: totalAmount,
              cards: resData
            })
          })
          .catch(function(err) {
            console.log(err)
          })
      }
    })
    .catch(function(err) {
      console.log(err)
    })
}

cardsCtr.cashCounter = function(req, res, next) {
  let projectDebit = [{
    $gte: ['$amount', 0]
  }, {
    $eq: ['$paymentMode', 'debit']
  }]

  let projectCredit = [{
    $gte: ['$amount', 0]
  }, {
    $or: [{
      $ne: ['$paymentMode', 'debit']
    }]
  }]

  if (req.query.from) {
    projectDebit.push({
      $gte: ['$createdAt', new Date(req.query.from)]
    }, {
      $lte: ['$createdAt', new Date(req.query.to)]
    })

    projectCredit.push({
      $gte: ['$createdAt', new Date(req.query.from)]
    }, {
      $lte: ['$createdAt', new Date(req.query.to)]
    })
  }

  TransactionLogModel.aggregate({
    $match: {
      'counter': { $ne: null }
    }
  }, {
    $project: {
      counter: 1,
      totalDebit: {
        $cond: [{
            $and: projectDebit
          },
          '$amount',
          0
        ]
      },
      totalCredit: {
        $cond: [{
            $and: projectCredit
          },
          '$amount',
          0
        ]
      },
    }
  }, {
    $group: {
      _id: '$counter',
      counterNumber: { $first: '$counter' },
      counterAmount: {
        $sum: {
          $subtract: [{
            $add: ['$totalCredit']
          }, '$totalDebit']
        }
      }
    }
  }, {
    $sort: {
      counterNumber: 1
    }
  })

  .then(function(cashCounts) {
    if (cashCounts.length > 0) {
      return res.send({
        status: 200,
        cashCounts: cashCounts,
        message: req.t('SUCCESS')
      })
    } else {
      return res.send({
        status: 400,
        message: req.t('NO_RECORD_FOUND')
      })
    }
  }).catch(function(err) {
    console.log(err)
  })
}

cardsCtr.cashTransaction = function(req, res, next) {
  let projectReversed = [{
    $ne: ['$transDetail', null]
  }, {
    $gte: ['$transDetail.amount', 0]
  }, {
    $eq: ['$transDetail.type', 'reversed']
  }]

  let projectSaturity = [{
    $ne: ['$transDetail', null]
  }, {
    $gte: ['$transDetail.amount', 0]
  }, {
    $eq: ['$transDetail.type', 'saturity']
  }]

  let projectDebit = [{
    $ne: ['$transDetail', null]
  }, {
    $gte: ['$transDetail.amount', 0]
  }, {
    $eq: ['$transDetail.paymentMode', 'debit']
  }, {
    $ne: ['$transDetail.type', 'reversed']
  }, {
    $ne: ['$transDetail.type', 'saturity']
  }]

  let projectCredit = [{
    $ne: ['$transDetail', null]
  }, {
    $gte: ['$transDetail.amount', 0]
  }, {
    $ne: ['$transDetail.paymentMode', 'debit']
  }, {
    $ne: ['$transDetail.type', 'reversed']
  }, {
    $ne: ['$transDetail.type', 'saturity']
  }]

  let projectCard = [{
    $ne: ['$transDetail', null]
  }, {
    $gte: ['$transDetail.amount', 0]
  }, {
    $eq: ['$transDetail.payment', 'card']
  }, {
    $ne: ['$transDetail.type', 'reversed']
  }, {
    $ne: ['$transDetail.type', 'saturity']
  }]

  let projectPaytm = [{
    $ne: ['$transDetail', null]
  }, {
    $gte: ['$transDetail.amount', 0]
  }, {
    $eq: ['$transDetail.payment', 'paytm']
  }, {
    $ne: ['$transDetail.type', 'reversed']
  }, {
    $ne: ['$transDetail.type', 'saturity']
  }]

  let projectCashDebit = [{
    $ne: ['$transDetail', null]
  }, {
    $gte: ['$transDetail.amount', 0]
  }, {
    $eq: ['$transDetail.payment', 'cash']
  }, {
    $eq: ['$transDetail.paymentMode', 'debit']
  }, {
    $ne: ['$transDetail.type', 'reversed']
  }, {
    $ne: ['$transDetail.type', 'saturity']
  }]

  let projectCashCredit = [{
    $ne: ['$transDetail', null]
  }, {
    $gte: ['$transDetail.amount', 0]
  }, {
    $eq: ['$transDetail.payment', 'cash']
  }, {
    $ne: ['$transDetail.paymentMode', 'debit']
  }, {
    $ne: ['$transDetail.type', 'reversed']
  }, {
    $ne: ['$transDetail.type', 'saturity']
  }]

  if (req.query.from) {
    projectReversed.push({
      $gte: ['$transDetail.createdAt', new Date(req.query.from)]
    }, {
      $lte: ['$transDetail.createdAt', new Date(req.query.to)]
    })

    projectSaturity.push({
      $gte: ['$transDetail.createdAt', new Date(req.query.from)]
    }, {
      $lte: ['$transDetail.createdAt', new Date(req.query.to)]
    })

    projectDebit.push({
      $gte: ['$transDetail.createdAt', new Date(req.query.from)]
    }, {
      $lte: ['$transDetail.createdAt', new Date(req.query.to)]
    })

    projectCredit.push({
      $gte: ['$transDetail.createdAt', new Date(req.query.from)]
    }, {
      $lte: ['$transDetail.createdAt', new Date(req.query.to)]
    })

    projectCard.push({
      $gte: ['$transDetail.createdAt', new Date(req.query.from)]
    }, {
      $lte: ['$transDetail.createdAt', new Date(req.query.to)]
    })

    projectPaytm.push({
      $gte: ['$transDetail.createdAt', new Date(req.query.from)]
    }, {
      $lte: ['$transDetail.createdAt', new Date(req.query.to)]
    })

    projectCashDebit.push({
      $gte: ['$transDetail.createdAt', new Date(req.query.from)]
    }, {
      $lte: ['$transDetail.createdAt', new Date(req.query.to)]
    })

    projectCashCredit.push({
      $gte: ['$transDetail.createdAt', new Date(req.query.from)]
    }, {
      $lte: ['$transDetail.createdAt', new Date(req.query.to)]
    })
  }

  CashierModel.aggregate({
    $lookup: {
      from: 'transactionLog',
      localField: '_id',
      foreignField: 'cashierId',
      as: 'transDetail'
    }
  }, {
    $unwind: {
      path: '$transDetail',
      preserveNullAndEmptyArrays: true
    }
  }, {
    $match: {
      '_id': !req.query.userId ? { $ne: null } : mongoose.Types.ObjectId(req.query.userId)
    }
  }, {
    $project: {
      totalReversed: {
        $cond: [{
            $and: projectReversed
          },
          '$transDetail.amount',
          0
        ]
      },
      totalSaturity: {
        $cond: [{
            $and: projectSaturity
          },
          '$transDetail.amount',
          0
        ]
      },
      totalDebit: {
        $cond: [{
            $and: projectDebit
          },
          '$transDetail.amount',
          0
        ]
      },
      totalCredit: {
        $cond: [{
            $and: projectCredit
          },
          '$transDetail.amount',
          0
        ]
      },
      totalCashDebit: {
        $cond: [{
            $and: projectCashDebit
          },
          '$transDetail.amount',
          0
        ]
      },
      totalCashCredit: {
        $cond: [{
            $and: projectCashCredit
          },
          '$transDetail.amount',
          0
        ]
      },
      totalCard: {
        $cond: [{
            $and: projectCard
          },
          '$transDetail.amount',
          0
        ]
      },
      totalPaytm: {
        $cond: [{
            $and: projectPaytm
          },
          '$transDetail.amount',
          0
        ]
      },
      _id: '$_id',
      cashierName: 1
    }
  }, {
    $group: {
      _id: '$_id',
      cashierName: { $first: '$cashierName' },
      cashierReversed: {
        $sum: '$totalReversed'
      },
      cashierSaturity: {
        $sum: '$totalSaturity'
      },
      cashierAmount: {
        $sum: {
          $subtract: [{
            $add: ['$totalCredit']
          }, '$totalDebit']
        }
      },
      cashierAmountCard: {
        $sum: {
          $add: '$totalCard'
        }
      },
      cashierAmountPaytm: {
        $sum: {
          $add: '$totalPaytm'
        }
      },
      cashierAmountCash: {
        $sum: {
          $subtract: [{
            $add: ['$totalCashCredit']
          }, '$totalCashDebit']
        }
      }
    }
  }, {
    $sort: {
      cashierName: 1
    }
  })

  .then(function(cardsTrans) {
    if (cardsTrans.length > 0) {
      return res.send({
        status: 200,
        cardsTrans: cardsTrans,
        message: req.t('SUCCESS')
      })
    } else {
      return res.send({
        status: 400,
        message: req.t('NO_RECORD_FOUND')
      })
    }
  }).catch(function(err) {
    console.log(err)
  })
}

cardsCtr.saveTransaction = function(transObj) {
  let transaction = new TransactionModel(transObj)
  let transactionLog = new TransactionLogModel(transObj)
  transaction.save();
  transactionLog.save()
}

cardsCtr.removeTransaction = function(rfid) {
  TransactionModel.remove({ rfidCardId: rfid }).exec()
}

module.exports = cardsCtr