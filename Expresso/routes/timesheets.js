const express = require('express');
const timesheetRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const validateTimesheet = (req, res, next) => {
  const newTimesheet = req.body.timesheet;
  if (!newTimesheet.hours || !newTimesheet.rate || !newTimesheet.date) {
    return res.sendStatus(400);
  }
  next();
}

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const values = {$timesheetId: timesheetId};
  const query = `SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId`;
  db.get(query, values, (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      req.timesheet = row;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetRouter.get('/', (req, res, next) => {
  const values = {$employeeId: req.params.employeeId};
  const query = `SELECT * FROM Timesheet WHERE
    Timesheet.employee_id = $employeeId`;

  db.all(query, values, (err, rows) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({timesheets: rows});
      }
    });
});

timesheetRouter.post('/', validateTimesheet, (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date;

  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: req.employee.id
  };

  const query = `INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES
    ($hours, $rate, $date, $employeeId)`;

  db.run(query, values, function(err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
          (err, row) => {
            res.status(201).json({timesheet: row});
          });
      }
    });
});

timesheetRouter.put('/:timesheetId', validateTimesheet, (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date;

  const values = {
                  $hours: hours,
                  $rate: rate,
                  $date: date,
                  $employeeId: req.params.employeeId,
                  $timesheetId: req.timesheet.id
                };

  const query = `UPDATE Timesheet SET hours = $hours, rate = $rate,
    date = $date, employee_id = $employeeId WHERE Timesheet.id = $timesheetId`

  db.run(query, values, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.timesheet.id}`,
        (err, row) => {
          res.status(200).json({timesheet: row});
        });
    }
  });
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
  const values = {$timesheetId: req.timesheet.id};
  const query = `DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId`;
  db.run(query, values, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});


module.exports = timesheetRouter;
