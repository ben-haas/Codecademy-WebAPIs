const express = require('express');
const menuRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemRouter = require('./menuItems.js');

const validateMenu = (req, res, next) => {
  const newMenu = req.body.menu;
  if (!newMenu.title) {
    return res.sendStatus(400);
  }
  next();
}

const checkForMenuItems = (req, res, next) => {
  const values = {$menuId: req.menu.id};
  const query = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`
  db.get(query, (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      return res.sendStatus(400);
    } else {
      next();
    }
  });
}

menuRouter.use('/:menuId/menu-items', menuItemRouter);

menuRouter.param('menuId', (req, res, next, menuId) => {
  const values = {$menuId: menuId};
  const query = `SELECT * FROM Menu WHERE Menu.id = $menuId`
  db.get(query, values, (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      req.menu = row;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({menus: rows});
    }
  });
});

menuRouter.post('/', validateMenu, (req, res, next) => {
  const title = req.body.menu.title;
  const values = {$title: title};
  const query = `INSERT INTO Menu (title) VALUES ($title)`

  db.run(query, values, function(err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (err, row) => {
        res.status(201).json({menu: row});
      });
    }
  });
});

menuRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

menuRouter.put('/:menuId', validateMenu, (req, res, next) => {
  const title = req.body.menu.title;
  const values = {
    $title: title,
    $menuId: req.menu.id
  };
  const query = `UPDATE Menu SET title = $title WHERE Menu.id = $menuId`

  db.run(query, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.menu.id}`, (err, row) => {
        res.status(200).json({menu: row});
      });
    }
  });
});

menuRouter.delete('/:menuId', checkForMenuItems, (req, res, next) => {
  const values = {$menuId: req.menu.id};
  const query = `DELETE FROM Menu WHERE Menu.id = $menuId`

  db.run(query, values, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuRouter;
