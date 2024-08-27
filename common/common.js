const con = require('./database');

const common = {

    CON_UPDATE: (query, data) => {
        return new Promise((resolve, reject) => {
            con.query(query, data, (err, result) => {
                if (!err) {
                    resolve();
                } else {
                    console.log('err :', err);
                    reject("failed");
                }
            })
        });
    },

    CON_INSERT: (query, data) => {
        return new Promise((resolve, reject) => {
            con.query(query, data, (err, result) => {
                if (!err) {
                    resolve(result.insertId);
                } else {
                    console.log('err :', err);
                    reject("failed");
                }
            })
        });
    },

    CON_DELETE: (query) => {
        return new Promise((resolve, reject) => {
            con.query(query, (err, result) => {
                if (!err) {
                    resolve();
                } else {
                    reject("failed");
                }
            });
        });
    },

    CON_SELECT: (query, type, no_data_err = true) => {
        return new Promise((resolve, reject) => {
            con.query(query, (err, result) => {
                if (!err) {
                    if (result.length > 0) {
                        if (type == 'Single') {
                            resolve(result[0]);
                        } else {
                            resolve(result);
                        }
                    } else {
                        if (no_data_err) {
                            reject("no_data");
                        } else {
                            resolve([]);
                        }
                    }
                } else {
                    console.log('CON_SELECT err :', err);
                    reject("failed");
                }
            })
        });
    },

}

module.exports = common;