const appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const AppointmentFactory = require('../factories/AppointmentFactory')
const mailer  = require('nodemailer')

const Appo = mongoose.model("Appointment", appointment)


class AppointmentService{
    async create(name, email, description, cpf, date, time){
        var newAppo = new Appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished: false,
            notified: false
        });
        try{
            await newAppo.save();
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }
    async GetAll(showFinished){
        if(showFinished){
            return await Appo.find();
        }else{
            var appos =  await Appo.find({'finished' : false});
            var appointments = [];

            appos.forEach(appointment =>{
                if(appointment.date != undefined){
                    appointments.push(AppointmentFactory.Build(appointment));
                }
            });

            return appointments;
        }
    }
    async getByID(id){
        try{
            var event = await Appo.findOne({'_id': id});
            return event;
        }catch(err){
            console.log(err);
        }
    }
    async finish(id){
        try{
            await Appo.findByIdAndUpdate(id,{finished: true});
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async Search(query){
        try{
            var appos = await Appo.find().or([{email: query}, {cpf: query}]);
            return appos;
        }catch(err){
            console.log(err);
            return []
        }
    }

    async SendNotification(){
        try{
            var appos = await this.GetAll(false);
            var transporter = mailer.createTransport({
                host: "sandbox.smtp.mailtrap.io",
                port: 2525,
                auth: {
                  user: "4256c343ab551f",
                  pass: "e06ac45af11392"
                }
              });
            appos.forEach(async app =>{
                var date = app.start.getTime();
                var hour = 1000 * 60 * 60;
                var gap = date - Date.now();
                if(gap <= hour){
                    if(!app.notified){
                        await Appo.findByIdAndUpdate(app.id, {notified: true});
                        transporter.sendMail({
                            from: "Herlinton Filho <herlinton@seth.com.br>",
                            to: app.email,
                            subject: "Consulta",
                            text: "Sua consulta irá acontecer em 1 hora!!"
                        }).then( ()=>{

                        }).catch(err =>{
                            console.log(err)
                        })
                    }
                }
            })
        }catch(err){
            console.log(err);
        }
    }
}

module.exports = new AppointmentService();