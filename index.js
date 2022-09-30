import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import yeast from 'yeast';
import knex from "knex";


//database connection
const db = knex({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'url_shortener'
    }
});
//database connection end

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/', (req, res) => {
    const url = req.body.url; // get url from form
    db('urls').insert({
        url,
    }).then(ids => {
        const alias = yeast.encode(ids[0]);
        res.redirect('/?alias=' + alias);
    })
});


app.get("/", (req, res) => {
    const alias = req.query.alias;
    ejs.renderFile('index.ejs', {
        alias,
    }, (err, html) => {
        if (err) {
            console.log(err);
            return;
        }
        res.send(html);
    });
});


app.get('/:alias', (req, res) => {
    const alias = req.params.alias;
    if (alias) {
        db.select('url').from('urls').where({ id: yeast.decode(alias)}).first().then(urlRow => {
            res.redirect(urlRow.url);
        });
    } else {
        next();
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
