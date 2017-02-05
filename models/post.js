var mongodb = require('./db.js');

function Post(username, doc, time) {
    this.user = username;
    this.post = doc;

    if (time) {
        this.time = time;
    } else {
        this.time = new Date();
    }
}

module.exports = Post;

Post.prototype.save = function(callback) {
    var post = {
        user: this.user,
        post: this.post,
        time: this.time
    };

    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('post', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.ensureIndex('user');
            collection.insert(post, { safe: true }, function(err, post) {
                mongodb.close();
                callback(err, post);
            });
        });
    });
}

Post.get = function(username, callback) {
    var query = {};
    if (username) {
        query = { user: username }
    }
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('post', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.find(query).sort({ time: -1 }).toArray(function(err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                var posts = [];
                docs.forEach(function(doc, index) {
                    var post = new Post(doc.user, doc.post, doc.time);
                    posts.push(post);
                });
                callback(null, posts);
            });
        });
    })
}
