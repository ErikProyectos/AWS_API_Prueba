import express from 'express';

const app = express();

app.use(express.json()); //middleware that transforms req.body in format json

const PORT = 3000;

app.get('/', (_req,res) => {
    console.log('Here goes the PING');
    res.send('PONG');
});

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});