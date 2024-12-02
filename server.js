import  express from "express";

const app = express();
const port = 5000;

// Standard CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );
    return next();
});

app.use(express.static("static"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());



app.get("/", (req, res) => {
    res.sendFile('static/login.html', { root: '.' })
});

app.get("/chat", (req, res) => {
    res.sendFile('static/chat.html', { root: '.' })
});

app.listen(port);
console.log(`Listening on http://localhost:${port}`)