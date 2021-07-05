const fs = require('fs')

module.exports = async function (context) {
    try {
        const data = fs.readFileSync('meta.txt', 'utf8').split('\n');
        const sha = data[0];
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: {
                name: "YNAB Sync",
                commit: data[1],
                shaLink: `https://github.com/dfar-io/ynab-sync/commit/${sha}`,
                date: data[2]
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (err) {
        console.error(err)
    }
}