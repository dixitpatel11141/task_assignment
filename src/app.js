// app.js
const express = require('express');
const app = express();
const hbs = require('hbs');
const path = require('path');
const bodyParser = require('body-parser');
const registration = require('./routes/registration');
const hello = require('./routes/hello');

app.set('view engine', 'hbs'); // Set the view engine to use Handlebars
app.set('views', __dirname + '/templates/views/'); // Set the directory where your views/templates will be stored
hbs.registerPartials(path.join(__dirname, './templates/partials/'));
hbs.registerHelper('getPartial', (request, response) => {
    const partialPage = request.data.root.pageName;
    if (partialPage == '') return 'home';
    else if (!(Object.keys(hbs.handlebars.partials).includes(partialPage))) return '404';
    else return partialPage;
});

// Router
// Serve static files from the public directory
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(registration);
app.use(hello);

// Define a route to render the "hello.hbs" template
app.use(express.static(path.join(__dirname, 'public'), { 
    // Specify the Content-Type explicitly for CSS files
    setHeaders: (res, filePath) => {
      if (path.extname(filePath) === '.css') {
        res.setHeader('Content-Type', 'text/css');
      }
    }
}));

app.get('/registration', (req, res) => {
    res.render('layout', {
        pageName: req.originalUrl.trim().replace('/', '').replace(/\?.*$/, ''),
        reqUrl: req.originalUrl,
        qData: req.query,
    });
});

app.get('/', (req, res) => {
    res.render('layout', {
        pageName: req.originalUrl.trim().replace('/', '').replace(/\?.*$/, ''),
        reqUrl: req.originalUrl,
        qData: req.query,
    });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
