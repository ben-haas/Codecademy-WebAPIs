const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const validateMenuItem = (req, res, next) => {
  const newMenuItem = req.body.menuItem;
  if (!newMenuItem.name || !newMenuItem.inventory || !newMenuItem.price) {
    return res.sendStatus(400);
  }
  next();
}

menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const values = {$menuItemId: menuItemId};
  const query = `SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId`;

  db.get(query, values, (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      req.menuItem = row;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuItemRouter.get('/', (req, res, next) => {
  const values = {$menuId: req.menu.id};
  const query = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`;

  db.all(query, values, (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({menuItems: rows});
    }
  });
});

menuItemRouter.post('/', validateMenuItem, (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;

  const values = {
    $name: name,
    $description: description ? description : "",
    $inventory: inventory,
    $price: price,
    $menuId: req.menu.id
  };

  const query = `INSERT INTO MenuItem (name, description, inventory, price,
    menu_id) VALUES ($name, $description, $inventory, $price, $menuId)`;

  db.run(query, values, function(err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
        (err, row) => {
          res.status(201).json({menuItem: row});
        });
    }
  });
});

menuItemRouter.put('/:menuItemId', validateMenuItem, (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;

  const values = {
    $name: name,
    $description: description ? description : "",
    $inventory: inventory,
    $price: price,
    $menuId: req.menu.id,
    $menuItemId: req.menuItem.id
  };

  query = `UPDATE MenuItem SET name = $name, description = $description,
    inventory = $inventory, price = $price, menu_id = $menuId WHERE
    MenuItem.id = $menuItemId`;

  db.run(query, values, (err) => {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.menuItem.id}`,
          (err, row) => {
            res.status(200).json({menuItem: row});
          });
      }
    });
});

menuItemRouter.delete('/:menuItemId', (req, res, next) => {
  const values = {$menuItemId: req.menuItem.id};
  const query = `DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId`;
  db.run(query, values, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});


module.exports = menuItemRouter;
