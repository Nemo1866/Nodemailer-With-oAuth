require("dotenv").config()
const express=require("express")
const nodemailer=require("nodemailer")
const app=express()
const {google}=require("googleapis")
const ejs=require("ejs")
const path=require("path")

const oAuthGoogleClient=new google.auth.OAuth2(process.env.CLIENT_ID,process.env.CLIENT_SECRET,process.env.REDIRECT_URI)
oAuthGoogleClient.setCredentials({refresh_token:process.env.REFRESH_TOKEN})

app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))
app.use("/public",express.static(path.join("public")))

app.get("/",(req,res)=>{
    res.render("contact",{
        msg:undefined
    })
})

app.post("/send",async (req,res)=>{
    try {
        let output=`
    <h1>Here is my Contact Details. </h1>
    <ul>
    <li>Name: ${req.body.name}</li>
    <li>Company: ${req.body.company}</li>
    <li>Email: ${req.body.email}</li>
    <li>PhoneNumber:${req.body.phone}</li>
    <h3>Your Message</h3>
    <p>${req.body.message}</p>
    </ul>
    `
    const accessToken=await oAuthGoogleClient.getAccessToken()

    const transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            type:"OAuth2",
            user:process.env.USER,
            clientId:process.env.CLIENT_ID,
            clientSecret:process.env.CLIENT_SECRET,
            refreshToken:process.env.REFRESH_TOKEN,
            accessToken:accessToken
        }
    })
    const emailOptions={
        from:`NodeMailer Contact  <${process.env.USER}>`,
        to:`${req.body.email}`,
        subject:"Nodemailer Contact Form",
        text:"CHecking ",
        html:output
    }

    transporter.sendMail(emailOptions,(err)=>{
        if(err){
            res.render("contact",{
                msg:"Could not send the email"
            })
        }else{
            res.render("contact",{
                msg:"Message Sent Sucessfully"
            })
        }
    })
        
    } catch (error) {
        console.log(error);
    }
    
    

})



app.listen(3000,()=>{
    console.log("Server is up and running on port 3000");
})