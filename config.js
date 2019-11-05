/**
 * Modules for Connection db
 */
const mysql = require('mysql')
const settings = require('./settings')
const db = mysql.createConnection(settings.db)

db.connect(err => {
    if (err) throw err

    console.log("db:ready")

    /**
     * consulta a la db
     */
    db.query(
        `CREATE TABLE IF NOT EXISTS images
        (
            id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            date_used TIMESTAMP NULL DEFAULT NULL,
            name VARCHAR(300) NOT NULL,
            size INT(11) UNSIGNED NOT NULL,
            data LONGBLOB NOT NULL,
    
            PRIMARY KEY (id),
            UNIQUE KEY name (name)
        )
        ENGINE=InnoDB DEFAULT CHARSET=utf8`
    );

})

module.exports = db