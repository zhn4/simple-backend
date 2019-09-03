let express = require('express')
let router = express.Router()
// let connection = require('../settings/db.js')
let pool = require('../settings/db.js')
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' })
// })

// module.exports = router

let md5 = require('js-md5')

let username = 'administrator',
    password = md5('test' + 123456)

function query(sql, values) {// sql查询封装
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, results) => {
      if(err) {
        res.json({
          code: 500,
          success: false,
          message: err,
          data: null
        })
        reject(err)
      }else {
        resolve(results)
      }
    })
  })
}

module.exports = (app) => {
  app.get('/', (req, res) => {// 首页
    pool.query('select * from catalog', (err, results) => {
      res.render('index', {
        title: '首页',
        list: (results && results.length > 0) ? results : []
      })
    })
  })
  app.get('/getCatalog', (req, res) => {// 查询目录
    let sql = 'select * from catalog'
    pool.query(sql, (err, results) => {
      if(err) {
        res.json({
          code: 500,
          success: false,
          message: err,
          data: null
        })
      }
      res.json({
        code: 200,
        success: true,
        message: null,
        data: results
      })
    })
  })
  app.post('/newCatalog', (req, res) => {// 新增目录
    if(!req.body.nameCn || !req.body.nameEn) {
      res.json({
        code: 0,
        success: false,
        data: null,
        message: '请完善目录信息'
      })
      return
    }
    let sql = 'select * from catalog where nameCn=? and nameEn=?'
    pool.query(sql, [req.body.nameCn, req.body.nameEn], (err, results) => {
      if(err) {
        res.json({
          code: 0,
          success: false,
          message: err,
          data: null
        })
        return
      }
      if(results.length > 0) {
        res.json({
          code: 0,// 查到相同数据
          success: false,
          data: null,
          message: '该目录已存在'
        })
      }else {
        let sql = 'insert into catalog (nameCn, nameEn) values (?, ?)'
        pool.query(sql, [req.body.nameCn, req.body.nameEn], (err, results) => {
          if(err) {
            res.json({
              code: 500,
              success: false,
              message: err,
              data: null
            })
            return
          }
          res.json({
            code: 200,
            success: true,
            message: null,
            data: null
          })
        })
      }
    })
  })
  app.post('/editCatalog', (req, res) => {// 编辑目录
    if(!req.body.id) {
      res.json({
        code: 0,
        success: false,
        data: null,
        message: '请选择目录'
      })
      return
    }
    let sql = 'update catalog set nameCn=?, nameEn=? where id=?'
    pool.query(sql, [req.body.nameCn, req.body.nameEn, req.body.id], (err, results) => {
      if(err) {
        console.log(err)
        res.json({
          code: 0,
          success: false,
          data: null,
          message: err
        })
        return
      }
      res.json({
        code: 200,
        success: true,
        data: null,
        message: null
      })
    })
  })
  app.post('/deleteCatalog', (req, res) => {// 删除目录
    if(!req.body.id) {
      res.json({
        code: 0,
        success: false,
        data: null,
        message: '请选择目录'
      })
      return
    }
    pool.query(
      'select * from catalog where id=?',
      [req.body.id],
      (err, results) => {
        if(err) {
          res.json({
            code: 0,
            success: false,
            data: null,
            message: err
          })
          return
        }
        if(results.length > 0) {
          let sql = 'delete from catalog where id=?'
          pool.query(sql, [req.body.id], (err, results) => {
            if(err) {
              res.json({
                code: 0,
                success: false,
                data: null,
                message: err
              })
              return
            }
            res.json({
              code: 200,
              success: true,
              data: null,
              message: null
            })
          })
        }else {
          res.json({
            code: 0,
            success: false,
            data: null,
            message: '不存在该目录'
          })
        }
      }
    )
  })
  app.post('/getProduct', (req, res) => {// 查询产品
    let sql = null
    if(!req.body.catalogId) {
      // res.json({
      //   data: 0,
      //   success: false,
      //   message: '请选择目录',
      //   data: null
      // })
      // return
      sql = 'select * from product'
    }else {
      sql = 'select * from product where catalogId=?'
    }
    // let sql = 'select * from product where catalogId=?'
    query(sql, [req.body.catalogId])
      .then(results => {
        res.json({
          code: 200,
          success: true,
          message: null,
          data: results
        })
      })
  })
  app.post('/newProduct', (req, res) => {// 新增产品
    if(!req.body.catalogId) {
      res.json({
        code: 0,
        success: false,
        message: '请选择产品目录',
        data: null
      })
      return
    }
    if(!req.body.nameCn || !req.body.nameEn) {
      res.json({
        code: 0,
        success: false,
        message: '请完善产品信息',
        data: null
      })
      return
    }
    let sql_catalog = 'select * from catalog where id=?'// 查目录是否存在
    query(sql_catalog, [req.body.catalogId])
      .then(results => {
        if(results.length > 0) {
          let sql_product = 'select * from product where nameCn=? and nameEn=? and catalogId=?'// 查产品是否存在
          query(sql_product, [req.body.nameCn, req.body.nameEn, req.body.catalogId])
            .then(resultsProduct => {
              if(resultsProduct.length > 0) {
                res.json({
                  code: 0,
                  success: false,
                  message: '该产品已存在',
                  data: null
                })
              }else {
                let sql = 'insert into product (nameCn, nameEn, description, catalogId) values (?, ?, ?, ?)'// 新建产品
                query(sql, [req.body.nameCn, req.body.nameEn, req.body.description, req.body.catalogId])
                .then(results => {
                  res.json({
                    code: 200,
                    success: true,
                    message: null,
                    data: null
                  })
                })
              }
            })
        }else {
          res.json({
            code: 0,
            success: false,
            message: '不存在该目录',
            data: null
          })
        }
      })
  })
  app.post('/editProduct', (req, res) => {// 编辑产品
    if(!req.body.catalogId) {
      res.json({
        code: 0,
        success: false,
        message: '请选择产品目录',
        data: null
      })
      return
    }
    if(!req.body.id) {
      res.json({
        code: 0,
        success: false,
        message: '请选择产品',
        data: null
      })
      return
    }
    if(!req.body.nameCn || !req.body.nameEn) {
      res.json({
        code: 0,
        success: false,
        message: '请完善产品信息',
        data: null
      })
      return
    }
    let sql = 'update product set nameCn=?, nameEn=?, description=?, catalogId=? where id=?'
    pool.query(sql, [req.body.nameCn, req.body.nameEn, req.body.description, req.body.catalogId, req.body.id], (err, results) => {
      if(err) {
        console.log(err)
        res.json({
          code: 0,
          success: false,
          data: null,
          message: err
        })
        return
      }
      res.json({
        code: 200,
        success: true,
        data: null,
        message: null
      })
    })
  })
}