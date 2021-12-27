const express = require('express');
const login = require("../models/login");
const router = express.Router();
const { DataTypes } = require("sequelize");
const sequelize = require("../models/index").sequelize;
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");


router.use(express.json())
router.post("/post", async (req, res) => {
  const saltRound = 10;
  const password = req.body.password;
  const hashPassword = await bcrypt.hash(password, saltRound);
  console.log(hashPassword, "ini yang udah di hash");
  try {
    const data = await login(sequelize, DataTypes).create({
      name: req.body.name,
      email: req.body.email,
      password: hashPassword
    });
    res.json(data);
  } catch (Error) {
    console.log(Error.errors[0].message);
    res.status(422).json({ message: Error.sqlMessage });
  }
});

router.post("/login", async (req, res) => {
  try {
    const name = req.body.name;
    const password = req.body.password;

    const data = await login(sequelize, DataTypes).findOne({
      where: {
        name: name,
      },
    });
    if (!data) {
      throw Error("Data tidak ditemukan");
    }
    const isVeryvied = await bcrypt.compare(password, data.password);
    console.log(isVeryvied);
    if (!isVeryvied) {
      throw Error("Password salah");
    }

    const payload = {
      name: name,
      password: data.password,
    };
    const token = jwt.sign(payload, "ada");
    res.json({ name: data.name, data: data.password, token: token });
  } catch (err) {
    res.json({ msg: err.message });
  }
});

const autentiCation = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(token);
  const user = jwt.decode(token, process.env.TOKEN);
  console.log(user);
  if (!user) res.json({ message: process.env.ERROR });
  req.payload = user;
  next();
};

router.post("/register", autentiCation, async (req, res) => {
  try {
    const name = req.body.name;
    console.log(req.payload);
    res.json({ message: `Hallo, ${name}` });
  } catch (Error) {
    console.log(Error.message);
    res.status(422).json({ message: Error.sqlMessage });
  }
});

const storage = multer.diskStorage({
  destination: path.join(__dirname + "/storage"),
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(".");
    const second = fileName.pop();

    const fullName = "Lucky Fauzi";
    const firstLetter = fullName.match(/L/);
    const secondLetter = fullName.match(/F/);
    console.log(file);

    cb( null,fullName + "-" + fileName + "-" + Date.now() + "-" + firstLetter + secondLetter + "." + second );
  },
});

console.log(path.join(__dirname + "/storage"), "<<<<<<<<<<<< ini dirname guys");
const upload = multer({ storage: storage });

router.get("/multer", upload.single("file"), async (req, res) => {
  res.status(200).json({
    data: req.file,
  });
});

router.get("/ambil", async (req, res) => {
    const data = await login(sequelize, DataTypes).findAll({});
    res.json(data);
  });

router.put("/update/:id", async function (req, res) {
    const id = req.params.id;
    const data = await login(sequelize, DataTypes).update(
      {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.json({ pesan: "Data berhasil di update" });
  });

router.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;
    const data = await login(sequelize, DataTypes).destroy({
      where: {
        id: id,
      },
    });
    res.json({Message: `ID No ${id} Berhasil di hapus!`});
  });
  
router.get("/pesan", (req, res) => {
    console.log('ini pesan bung!')
    res.end()
})

module.exports = router;
