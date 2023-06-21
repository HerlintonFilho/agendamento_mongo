const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const appointmentService = require('./services/appointmentService');
const AppointmentFactory = require('./factories/AppointmentFactory');


mongoose.connect('mongodb://localhost:27017/agendamento', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.get('/', (req, res)=>{
    res.render("index")
})

app.get('/cadastro', (req, res) =>{
    res.render("create");
})

app.post('/create', async(req, res)=>{
    var status = await appointmentService.create(
        req.body.name,
        req.body.email,
        req.body.description,
        req.body.cpf,
        req.body.date,
        req.body.time
    )
    if(status){
        res.redirect('/')
    }else{
        res.send("Erro")
    }
})

app.get("/getCalendar", async (req, res) =>{
    var appointments = await appointmentService.GetAll(false);
    res.json(appointments);

})

app.get('/event/:id', async(req,res)  =>{
    var appointment = await appointmentService.getByID(req.params.id)
    console.log(appointment)
    res.render("event", {appo: appointment})
})

app.post('/finish', async(req, res)=>{
    var id = req.body.id;
    var result = await appointmentService.finish(id);
    res.redirect("/");
})

app.get('/list', async(req, res) =>{
    var appos = await appointmentService.GetAll(true);
    res.render("list", {appos});
});

app.get('/searchresult', async(req, res) =>{
    console.log(req.query.search);
    var appos = await appointmentService.Search(req.query.search);
    res.render("list", {appos})
})

var pooltime  = 1000 * 60 * 5;

setInterval(async () =>{
    await appointmentService.SendNotification();
},pooltime)

app.listen(8080, ()=>{
    console.log("Rodando!!")
})


