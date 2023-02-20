require("dotenv").config()
const express=require("express")
const nodemailer=require("nodemailer")
const app=express()
const {google}=require("googleapis")
const ejs=require("ejs")
const path=require("path")
const multer=require("multer")

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
const storage=multer.diskStorage({
    destination:"./public/uploads",
    filename:function(req,file,cb){
cb(null,file.fieldname+"-"+Date.now()+path.extname(file.originalname))
    }
})

const uploads=multer({
    storage:storage,
}).single('file')
app.post("/send",async (req,res)=>{

    try {
        uploads(req,res,async(err)=>{
        if(err){
            res.send("Something went wrong")
        }else{
            let path=req.file.path
      
        let output=`
    <h1>Here is my Contact Details. </h1>
    <ul>
    <li>Name: ${req.body.name}</li>
    <li>Company: ${req.body.company}</li>
   
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
    let {email1,email2,email3,email4}=req.body
    const emailOptions={
        from:`NodeMailer Contact  <${process.env.USER}>`,
        to:[email1,email2,email3,email4],
        subject:"Nodemailer Contact Form",
        attachments:[
            {path:path}
        ],
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
                msg:err
            })
            console.log(err);
        }
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