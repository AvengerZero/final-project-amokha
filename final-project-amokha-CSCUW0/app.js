"use strict";

const express = require("express");
const mysql = require("promise-mysql");
const multer = require("multer"); // Handles form-data requests.
const app = express();
app.use(express.static("public"));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

const INVALID_PARAM_ERROR = 400;
const FILE_ERROR = 500;
const SERVER_ERROR = "Something went wrong on the server.";

// Gets all menu items (JSON), organized by category alphabetically.
app.get("/info", async function(req, res) {
  let menu;
  try {
    menu = await queryHome("SELECT * FROM info ORDER BY id;");
    res.json(menu);
  } catch (err) {
    res.type("text");
    res.status(FILE_ERROR).send(SERVER_ERROR);
  }
});

app.get("/search/:string", async function(req, res) {
  let result;
  let db;
  try {
    db = await getDB();
    result = await db.query("SELECT * FROM markers WHERE (state LIKE " +
      db.escape('%' + req.params.string + '%') + " OR city LIKE " +
      db.escape('%' + req.params.string + '%') + ");");
    db.end();
    res.json(result);
  } catch (err) {
    res.type("text");
    res.status(FILE_ERROR).send(SERVER_ERROR);
  }
});

app.get("/markers", async function(req, res) {
  let menu;
  try {
    menu = await queryHome("SELECT * FROM markers WHERE market = 1 ORDER BY id;");
    res.json(menu);
  } catch (err) {
    res.type("text");
    res.status(FILE_ERROR).send(SERVER_ERROR);
  }
});

app.get("/newuid", async function(req, res) {
  let menu;
  try {
    menu = await queryHome("SELECT * FROM bids ORDER BY uid;");
    let ret = (menu.length !== 0) ? (1 + menu[menu.length - 1].uid) : 1;
    res.send({uid: ret});
  } catch (err) {
    res.type("text");
    res.status(FILE_ERROR).send(SERVER_ERROR);
  }
});

app.get("/bids", async function(req, res) {
  let menu;
  try {
    menu = await queryHome("SELECT * FROM bids ORDER BY id;");
    res.json(menu);
  } catch (err) {
    res.type("text");
    res.status(FILE_ERROR).send(SERVER_ERROR);
  }
});

app.get("/bids/:uid", async function(req, res) {
  let menu;
  try {
    menu = await queryHome("SELECT h.city, b.id, b.uid, b.bid, b.highest, i.name " +
      "FROM bids b JOIN info i ON i.id = " +
      "b.id JOIN homes h ON h.id = i.id WHERE b.uid = " +
      req.params.uid + " ORDER BY b.bid DESC;");
    res.json(menu);
  } catch (err) {
    res.type("text");
    res.status(FILE_ERROR).send(SERVER_ERROR);
  }
});

app.get("/reset", async function(req, res) {
  let db;
  try {
    db = await getDB();
    await db.query("UPDATE info SET price = ogprice;");
    await db.query("DELETE FROM bids");
    await db.query("UPDATE info SET bidders = 0");
    await db.query("UPDATE markers SET market = 1");
    db.end();
    res.redirect('back');
  } catch (err) {
    res.type("text");
    res.status(FILE_ERROR).send(SERVER_ERROR);
  }
});

app.post("/bidding", verifyOrder, async function(req, res) {
  res.type("text");
  let uid = req.body.uid;
  let id = req.body.id;
  let price = req.body.bid;
  let db;
  try {
    db = await getDB();
    let checkingbid =
      await db.query("SELECT market FROM markers WHERE (id = " + id + " AND market = 0);");
    if (checkingbid[0]) {
      res.send("PLEASE REFRESH PAGE, NEW DATA");
    } else {
      if (await db.query("SELECT * FROM bids WHERE (id = " + id + " AND highest = 1);")) {
        await db.query("UPDATE bids SET highest = 0 WHERE (id = " + id + " AND highest = 1);");
      }
      await db.query("INSERT INTO bids (uid, id, bid, highest) VALUES (" + uid + ", " + id + ", " +
        price + ", 1);");
      await db.query("UPDATE info SET price = " + price + " WHERE id = " + id + ";");
      await db.query("UPDATE info SET bidders = bidders + 1 WHERE id = " + id + ";");
      db.end();
      res.send("Congrats you are the highest bidder!");
    }
  } catch (err) {
    if (db) {
      db.end();
    }
    res.status(FILE_ERROR).send(SERVER_ERROR);
  }
});

app.post("/endbidding", verifyOrderEnd, async function(req, res) {
  res.type("text");
  let id = req.body.id;
  let db;
  try {
    db = await getDB();
    await db.query("UPDATE markers SET market = 0 WHERE id = " + id + ";");
    db.end();
    res.send("Congrats the bid is over!");
  } catch (err) {
    if (db) {
      db.end();
    }
    res.status(FILE_ERROR).send(SERVER_ERROR);
  }
});

/**
 * Verifies that the body parameters of an order are set.
 * @param {object} req - The request
 * @param {object} res - The response
 * @param {callback} next - A callback to the next middleware function.
 */
function verifyOrder(req, res, next) {
  if (req.body.uid && req.body.id && req.body.bid) {
    next();
  } else {
    res.type("text");
    res.status(INVALID_PARAM_ERROR).send("Missing required parameters!");
  }
}

/**
 * Verifies that the body parameters of an order are set.
 * @param {object} req - The request
 * @param {object} res - The response
 * @param {callback} next - A callback to the next middleware function.
 */
function verifyOrderEnd(req, res, next) {
  if (req.body.id) {
    next();
  } else {
    res.type("text");
    res.status(INVALID_PARAM_ERROR).send("Missing required parameters!");
  }
}

app.get("/info/:id", async function(req, res) {
  let menu;
  try {
    menu = await queryHome("SELECT * FROM info JOIN homes ON homes.id = info.id WHERE info.id = " +
      req.params.id + " ORDER BY info.id");
    res.json(processInfo(menu));
  } catch (err) {
    res.type("text");
    res.status(FILE_ERROR).send(SERVER_ERROR);
  }
});

/**
 * Takes an array of menu items and processes it into a category to item array mapping.
 * @param {array} homes - An array of menu items with fields category, subcategory, name, price.
 * @returns {object} - The formatted menu object.
 */
function processInfo(homes) {
  let info = homes[0]["info"];
  let price = homes[0]["price"];
  let owner = homes[0]["Owner"];
  let bidders = homes[0]["bidders"];
  let id = homes[0]["id"];
  let awards = homes[0]["awards"];
  let url = homes[0]["url"];
  let name = homes[0]["name"];
  let address = homes[0]["address"] + ", " + homes[0]["city"] + ", " + homes[0]["state"];
  return {info: info, price: price, owner: owner, bidders: bidders,
    id: id, awards: awards, url: url, name: name, address: address};
}

/**
 * Establishes a database connection and returns the database object.
 * @returns {Object} - The database object for the connection.
 */
async function getDB() {
  let db = await mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "root",
    database: "test"
  });
  return db;
}

/**
 * Returns the menu items from the database as an array of objects.
 * @param {string} query - The MySQL query to send to the database.
 * @returns {array} - The menu items
 */
async function queryHome(query) {
  let db, result;
  try {
    db = await getDB();
    result = await db.query(query);
    db.end();
    return result;
  } catch (err) {
    if (db) {
      db.end();
    }
    throw err;
  }
}

const PORT = process.env.PORT || 8000;
app.listen(PORT);
