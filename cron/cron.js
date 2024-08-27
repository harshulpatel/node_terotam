const mongoose = require('mongoose');
const common = require('../common/common')

mongoose.connect('mongodb://localhost:27017/terotam', { useNewUrlParser: true, useUnifiedTopology: true });

const syncData = async () => {
    console.log('================cron working==============')
  try {
    
    const users = await common.CON_SELECT(`SELECT * FROM users`,'Multi',false);
    const category = await common.CON_SELECT(`SELECT * FROM category`,'Multi',false);
    const menu = await common.CON_SELECT(`SELECT * FROM menu`,'Multi',false);

    const userInst = users.map(x => ({
        ids:x.id,
        first_name: x.first_name,
        last_name: x.last_name,
        email:x.email,
        phone:x.phone,
        password:x.password,
        token:x.token,
        is_active:x.is_active,
        is_deleted:x.is_deleted,
        created_at:x.created_at,
        updated_at:x.updated_at
      }));

    const categoryInst = category.map(x => ({
        ids:x.id,
        name:x.name,
        is_active:x.is_active,
        is_deleted:x.is_deleted,
        created_at:x.created_at,
        updated_at:x.updated_at
    }));
   
    const menuInst = menu.map(x => ({
        ids:x.id,
        cat_id:x.cat_id,
        name:x.name,
        photo:x.photo,
        is_active:x.is_active,
        is_deleted:x.is_deleted,
        created_at:x.created_at,
        updated_at:x.updated_at
    }));
    
    
    await mongoose.connection.collection('userInst').deleteMany({});
    await mongoose.connection.collection('categoryInst').deleteMany({});
    await mongoose.connection.collection('menuInst').deleteMany({});

    await mongoose.connection.collection('userInst').insertMany(userInst);
    await mongoose.connection.collection('categoryInst').insertMany(categoryInst);
    await mongoose.connection.collection('menuInst').insertMany(menuInst);
    
    console.log('Data synced');
  } catch (error) {
    console.error('Error syncing data:', error);
  }
};

module.exports = syncData;