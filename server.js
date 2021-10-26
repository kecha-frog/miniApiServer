const express = require('express')
const cookieParser = require('cookie-parser')

const fs = require("fs");
const path = require("path");

const notAllowedText = 'HTTP method not allowed'
const filesDir = path.join(__dirname, 'files')
const cookieSetting = {maxAge: 1000 * 60 * 60 * 24 * 2, httpOnly: true};

const user = {
    id: 123,
    username: 'testuser',
    password: 'qwerty'
};


//Вызываю ошибку
const throwError = (error) => {
    throw {name: error}
}

//Проверка авторизации(выбрасывание ошибки)
const checkAuthorization = (req) => {
    const {userid, authorized} = req.cookies
    if (userid !== user.id.toString() || authorized !== 'true') {
        throwError('unauthorized')
    }
}

//Отправка ошибки
const errorResponseSend = (res, err) => {
    const {name} = err;
    if (name === 'unauthorized') {
        res.status(401)
            .send('No authorization');
    } else if (name === 'noFileName' || name === 'noContent') {
        res.status(400)
            .send(name);
    } else {
        res.status(500)
            .send('Internal server error\n' + err + 'error');
    }
}

const app = express()
const port = 8000

//JSON parser
app.use(express.json())
app.use(cookieParser())


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

// 3
app.route('/delete')
    .delete((async (req, res) => {
        try {
            //Проверка
            checkAuthorization(req)

            const {filename} = req.body

            //Если не передали название файла
            if (!filename?.length) {
                throwError('noFileName')
            }

            const filePath = filesDir + `/${filename}.txt`
            await fs.unlink(filePath,
                (err) => {
                    if (err) {
                        //Если ошибка то будет статус 500
                        errorResponseSend(res, 'delete')
                    } else {
                        res.status(200)
                            .send('File delete');
                    }
                });
        } catch (err) {
            // Отлавливаю ошибку
            errorResponseSend(res, err)
        }
    }))
    .all((req, res) => {
        res.status(405)
            .send(notAllowedText);
    })

// 2
app.route('/post')
    .post(async (req, res) => {
        try {
            const {filename, content} = req.body
            //Проверка
            checkAuthorization(req)

            //Если не передали название файла
            if (!filename?.length) {
                throwError('noFileName')
            }
            //Если не передали текст файла
            if (!content?.length) {
                throwError('noContent')
            }

            await fs.writeFile(filesDir + `/${filename}.txt`, content, {flag: 'w+'},
                (err) => {
                    //Если ошибка то будет статус 500
                    if (err) throwError('fileWrite')
                    res.status(200)
                        .send("File add")
                })
        } catch (err) {
            //Отлавливаю ошибку
            errorResponseSend(res, err)
        }


    })
    .all((req, res) => {
        res.status(405)
            .send(notAllowedText);
    })

app.route('/redirect')
    .get((req, res) => {
        res.setTimeout(3000, () => {
            res.redirect('/redirected')
        })
    })
    .all((req, res) => {
        res.status(405)
            .send(notAllowedText);
    })

app.route('/redirected')
    .get((req, res) => {
            res.status(200)
                .send('/redirect moved to /redirected')
        }
    )
    .all((req, res) => {
        res.status(405)
            .send(notAllowedText);
    })

// 1
app.route('/auth',)
    .post((req, res) => {
            const {login, pass} = req.body
            //Если пришли логин и пароль
            if (login === user.username && pass === user.password) {
                res.status(200)
                //Передаю Cookie
                res.cookie('userid', user.id, cookieSetting)
                res.cookie('authorized ', true, cookieSetting)
                res.end()
            } else {
                res.status(400)
                    .send('wrong login or password')
            }

        }
    )
    .all((req, res) => {
        res.status(405)
            .send(notAllowedText);
    })


app.use(function (req, res) {
    res.status(404)
        .send('not found');
});


app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})
