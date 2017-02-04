var mongodb = require('./db.js');

function User(user) {
    this.name = user.name;
    this.password = user.password;
}
module.exports = User;

User.prototype.save = function(callback) {
    var user = {
        name: this.name,
        password: this.password
    }

    // 打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        // 打开集合
        db.collection('users', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex('name', { unique: true });
            collection.insert(user, { safe: true }, function(err, user) {
                mongodb.close();
                callback(err);
            });
        });
    });
}

User.get = function(username, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('users', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({ name: username }, function(err, doc) {
                mongodb.close();
                if (doc) {
                    var user = new User(doc);
                    callback(err, user);
                } else {
                    callback(err, null);
                }
            });
        });
    });
}