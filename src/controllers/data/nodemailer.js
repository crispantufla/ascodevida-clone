const nodemailer = require("nodemailer");

const sendMail = (code, email) => {
    console.log("estoy en sendMail");
    const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: "advcopy@outlook.es",
            pass: "150382Pato"
        }
    });

    let info = transporter.sendMail({
        from: 'advcopy@outlook.es', 
        to: email, 
        subject: "Codigo de verificacion", 
        text: "Su codigo de verificacion es: " + code + " Por favor introduzcalo en el formulario y restaure su contraseña"
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

}
module.exports = {
    sendMail,
}