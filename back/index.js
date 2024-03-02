import express from "express";
import cors from "cors";
import connection, { dbName } from "./connection.js";
import multer from "multer";
import path from "path";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from 'cloudinary';

const app = express();
const port = 8052;
let db;


cloudinary.config({
    cloud_name: 'da2oqj7qe',
    api_key: '687377994928293',
    api_secret: 'GcXxtuXnuQ-LJGycDcmf_DGqw_E'
});


app.use(fileUpload({ useTempFiles: true }))
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cors({ origin: "http://127.0.0.1:5500" }));
// app.use('/uploads', express.static('uploads'))



app.options("/", (req, res) => {
    res.header("Access-Control-Allow-Methods", "POST")
    res.sendStatus(200)
})


app.post('/adddata', express.json(), (req, res) => {
    let file = req.files.image;
    console.log(file)

    cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
        if (err) {
            console.error("this is error:" + err);
            // res.status(500).send(JSON.stringify('Error uploading to Cloudinary'));
        } else {
            console.log(result);
            // res.status(200).send(JSON.stringify('File uploaded to Cloudinary'));
        }
    });
});

app.post('/shop', express.json(), (req, res) => {
    let selectedgender = req.body.selectedgender;
    console.log(selectedgender)

    const CloudName = 'da2oqj7qe'

    // if(selectedgender === 'Male'){
    //     url = `https://res.cloudinary.com/${CloudName}/image/list/male.json`
    //     console.log(url)
    // }

    // const cloudinary = require('cloudinary').v2;

    if (selectedgender === 'Male') {
        cloudinary.api.resources({ type: 'upload', prefix: 'male/' }, (error, result) => {
            if (error) {
                console.error('Error fetching images:', error);
            } else {
                res.send(result);
            }
        })
    } else {
        cloudinary.api.resources({ type: 'upload', prefix: 'female/' ,max_results: 30  }, (error, result) => {
            if (error) {
                console.error('Error fetching images:', error);
            } else {
                res.send(result);
            }
        })
    }







})


app.post('/newentry', express.json(), async (req, res) => {
    let { MobileNum, password } = req.body;

    let data = await db.collection('loginuser').find().toArray();
    let exist = false;

    for (let i = 0; i < data.length; i++) {
        if (data[i].MobileNum === MobileNum) {
            exist = true;
            break;
        }
    }

    if (exist) {
        res.send(JSON.stringify('Mobile Number already exists'));
    } else {
        let detail = await db.collection('loginuser').insertOne({ MobileNum, password });
        console.log(detail);
        res.send(JSON.stringify('New entry added'));
    }
})

app.post('/login', async (req, res) => {
    let details = await db.collection('loginuser').find().toArray()
    let MobileNum = req.body.MobileNum
    let password = req.body.password
    // console.log(req.body)
    // console.log(details)
    let i
    let exist = true
    for (i = 0; i < details.length; i++) {
        if (details[i].MobileNum == MobileNum && details[i].password == password && exist) {
            i = details.length
            exist = false
        }
    }
    if (exist == false) {
        res.send(JSON.stringify('successful login'))
    }
    if (exist == true) {
        res.send(JSON.stringify('login failed'))
    }
})

app.post('/userdata', async (req, res) => {
    let { name, gender, dob, state, city, address, pincode } = req.body
    let data = await db.collection('userdata').insertOne({ name, gender, dob, state, city, address, pincode })
    console.log(data)
    res.send(JSON.stringify('Data Saved'))
})

connection.then((client) => {
    db = client.db(dbName);
    app.listen(port, () => console.log(port + " started"))
});