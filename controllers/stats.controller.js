const ctrlStats = {}
const db = require('../config')

ctrlStats.stats = (req, res) => {
    db.query("SELECT COUNT(*) total" +
             ", SUM(size) size " +
             ", MAX(date_created) last_created " +
             "FROM images", (err, rows) => {
        if (err) {
            return res.status(500).end();
        }
        
        rows[0].uptime = process.uptime();

        return res.send(rows[0]);
    });
}

module.exports = ctrlStats