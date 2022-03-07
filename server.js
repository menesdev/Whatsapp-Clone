// importing
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'

// app config
const app = express()
dotenv.config() 

const pusher = new Pusher({
    appId: "1357379",
    key: "183a99262503ced6e023",
    secret: "1da026da5b1f58c37043",
    cluster: "eu",
    useTLS: true
});


// middleware
app.use(express.json())
app.use(cors())


// app.get('/', (req, res) => {
//     res.send('Hello to Whatsapp Clone API')
// })

// Database config
const PORT = process.env.PORT || 9000

mongoose.connect(process.env.MONGODB_URI || process.env.connection_url, {
    // useCreateIndex: true,
    useNewUrlParser: true,
    // useUnifiedTopology: true
})

const db = mongoose.connection

db.once('open', () => {
    console.log('DB connected')

    const msgCollection = db.collection('messagecontents')
    const changeStream = msgCollection.watch()

    changeStream.on('change', (change) => {
        console.log('A change occured',change)

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument
            pusher.trigger('messages', 'inserted', 
            {
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received
            }) 
        } else {
            console.log('Error triggering Pusher')
        }
    })

})

// api routes
app.get('/', (req, res) => res.status(200).send('hello world'))

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
        
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body
    
    Messages.create(dbMessage, (err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

app.use(express.static(path.join(__dirname, "/client/build")));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});

// if(process.env.NODE_ENV === 'production') {
//     app.use(express.static('client/build'))
// }

// listen
app.listen(PORT, () => console.log(`Listening on localhost:${PORT}`))


