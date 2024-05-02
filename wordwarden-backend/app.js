require("dotenv").config() 

var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")

var notesRouter = require("./routes/notes")
var modelsRouter = require("./routes/models")

var app = express()
const cors = require("cors") 

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  "http://localhost:4001",
  "https://wordwarden-frontend-fawn.vercel.app" 
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"], 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  credentials: true 
};

app.use(cors(corsOptions)) 

app.use(logger("dev"))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))


app.use("/models", modelsRouter)
app.use("/notes", notesRouter)

module.exports = app
