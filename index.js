require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const common = require('./common/common');
const cron = require('node-cron');
const datacron = require('./cron/cron');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());

const upload = multer({ dest: 'images/' });

cron.schedule('*/10 * * * *', datacron);

const authenticateToken = async(req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
  
   jwt.verify(token, process.env.JWT_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
 }

//user signup api
app.post('/signup', async (req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;

  if (!first_name || !last_name || !email || !phone || !password) {
    return res.status(400).send('All fields are required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const addObj = {
    first_name: first_name,
    last_name: last_name,
    email: email,
    phone: phone,
    password: hashedPassword
  }

  try {
    const result = await common.CON_INSERT(`INSERT INTO users SET ?`, addObj)

    res.status(201).json({ userId: result });

  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

//user login api
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const result = await common.CON_SELECT(`SELECT * FROM users WHERE email ='${email}' and is_active=1 and is_deleted=0`,'Single', false)
      
      if (result.length < 1) {
        return res.status(401).send('Invalid email');
      } else {
        if(!(await bcrypt.compare(password, result.password))){
            return res.status(401).send('Invalid password');
        } else {
            const token = jwt.sign({ userId: result.id }, process.env.JWT_KEY, { expiresIn: '7h' });
            res.json({ token });
        }
      }
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
});

//create category
app.post('/menu/category/create', authenticateToken, async (req, res) => {
    const { name } = req.body;
    try {
      await common.CON_INSERT(`INSERT INTO category SET ?`,{name: name})
      res.status(201).send('Category added');
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
});

//create menu item
app.post('/menu/item/create', [authenticateToken, upload.single('photo')], async (req, res) => {
    const { cat_id, name } = req.body;
    const photo = req.file.path;
  
    try {
      await common.CON_INSERT(`INSERT INTO menu SET ?`,{cat_id: cat_id, name: name, photo: photo})
      res.status(201).send('Item added in menu');
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
});

//get category listing
app.get('/menu/categorieslist', authenticateToken, async (req, res) => {
    try {
      const result = await common.CON_SELECT(`SELECT * FROM category WHERE is_active=1 and is_deleted=0`,'Multi');
      res.json(result);
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
});

//get menu item by category id
app.get('/menu/items/:cat_id', authenticateToken, async (req, res) => {
    const { cat_id } = req.params;
    try {
      const result = await common.CON_SELECT(`SELECT * FROM menu WHERE cat_id='${cat_id}' and is_active=1 and is_deleted=0`,'Multi')
      res.json(result);
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
});

app.listen(8080, () => {
  console.log('Server running on port 8080');
});
