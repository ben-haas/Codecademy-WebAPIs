const express = require('express');
const employeeRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetRouter = require('./timesheets.js');

const validateEmployee = (req, res, next) => {
  const newEmployee = req.body.employee;
  if (!newEmployee.name || !newEmployee.position || !newEmployee.wage) {
    return res.sendStatus(400);
  }
  next();
}

employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
  const values = {$employeeId: employeeId};
  const query = 'SELECT * FROM Employee WHERE Employee.id=$employeeId';

  db.get(query, values, (err, row) => {
    if(err) {
      next(err);
    } else if (row) {
      req.employee = row;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeeRouter.get('/', (req, res, next) => {
  const query = `SELECT * FROM Employee WHERE Employee.is_current_employee = 1`;
  db.all(query, (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({employees: rows});
    }
  });
});

employeeRouter.post('/', validateEmployee, (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  }

  const query = `INSERT INTO Employee (name, position, wage, is_current_employee)
    VALUES ($name, $position, $wage, $isCurrentEmployee)`;

  db.run(query, values, function(err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
        (err, row) => {
          res.status(201).json({employee: row});
        });
    }
  });
});

employeeRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

employeeRouter.put('/:employeeId', validateEmployee, (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee,
    $employeeId: req.employee.id
  }

  const query = `UPDATE Employee SET name = $name, position = $position,
    wage = $wage, is_current_employee = $isCurrentEmployee
    WHERE id = $employeeId`;

  db.run(query, values, (err) => {
    db.get(`SELECT * FROM Employee WHERE id = ${req.employee.id}`,
      (err, row) => {
        res.status(200).json({employee: row});
      });
  });
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
  const values = {$employeeId: req.employee.id};
  const query = `UPDATE Employee SET is_current_employee = 0 WHERE
    Employee.id = $employeeId`;

  db.run(query, values, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(200);
    }
  });
});

module.exports = employeeRouter;
