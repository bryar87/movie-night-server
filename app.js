const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

// // Database collections
// const Datastore = require('nedb')
// const users = new Datastore({ filename: './data/users', autoload: true })
// const rooms = new Datastore({ filename: './data/rooms', autoload: true })

// Constants
const port = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// Creating server
const app = express()

// Express middlewares
app.use(cors())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const httpServer = http.createServer(app)
const io = socketio(httpServer, {
	cors: {
		origin: true,
		methods: ['GET', 'POST'],
	},
})

// Data
const users = []
const rooms = []

// Importing route handlers - socket.io
const { login, logout } = require('./auth-handler')(io, { users, rooms })
const { createRoom, getRoom, joinRoom, addVideo, removeVideo, startRoom, setRoomInfo, stop, sync, leaveRoom } = require('./room-handler')(io, { users, rooms })

// Assigning route handlers - socket.io
const onConnection = (socket) => {
	// Auth events
	socket.on('auth:login', login)
	socket.on('auth:logout', logout)

	// Room events
	socket.on('room:create', createRoom)
	socket.on('room:get', getRoom)
	socket.on('room:join', joinRoom)
	socket.on('room:addvideo', addVideo)
	socket.on('room:removevideo', removeVideo)
	socket.on('room:startroom', startRoom)
	socket.on('room:setroominfo', setRoomInfo)
	socket.on('room:stop', stop)
	socket.on('room:sync', sync)
	socket.on('room:leave', leaveRoom)
}

// Starting http and socketio servers
io.on('connection', onConnection)
httpServer.listen(port, () => console.log(`Listening on http://localhost:${port}`))
