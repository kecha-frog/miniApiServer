const express = require('express')
const fs = require("fs");
const path = require("path");

const successText = 'success'
const notAllowedText = 'HTTP method not allowed'
const filesDir = path.join(__dirname, 'files')


const app = express()
const port = 8000

// 1
app.route('/get')
    .get((req, res) => {
        try {
            const files = fs.readdirSync(filesDir).join(', ');
            res.status(200)
                .send(files);
        } catch {
            res.status(500)
                .send('Internal server error');
        }
    })
    .all((req, res) => {
        res.status(405)
            .send(notAllowedText);
    })

// 2
app.route('/delete')
    .delete(((req, res) => {
        res.status(200)
            .send(successText);
    }))
    .all((req, res) => {
        res.status(405)
            .send(notAllowedText);
    })

app.route('/post')
    .post((req, res) => {
        res.status(200)
            .send(successText);
    })
    .all((req, res) => {
        res.status(405)
            .send(notAllowedText);
    })

// 3
app.route('/redirect')
    .get((req, res) => {
        res.setTimeout(3000, () => {
            //Альтернативный способ
            // res.status(301)
            //     .location('/redirect')

            res.redirect('/redirected')
        })
    })

app.route('/redirected')
    .get((req, res) => {
            res.status(200)
                .send('/redirect moved to /redirected')
        }
    )


app.use(function (req, res) {
    res.status(404)
        .send('not found');
});


app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})
