const express=require('express')
const app =express()
const mongodb=require('mongodb')
const mclient=mongodb.MongoClient
const exhs=require('express-handlebars')
app.set('view engine','hbs');
app.set('views','views')
app.use(express.json())
const path=require('path')

const publicStaticDirPath = path.join(__dirname,"../views");
app.use(express.static(publicStaticDirPath));
app.use(express.static(path.join(__dirname, 'public')));
const bodyparser=require('body-parser')
const { log } = require('util')
const { sign } = require('crypto')
//const { sign } = require('crypto')x 


app.use(bodyparser.urlencoded({extended:true}))

let client='';
let signup='';
let collec='';
let collec2='';
async function dbconnect(){
     client=await mclient.connect('mongodb://127.0.0.1:27017');
     if(client)
       console.log('server connected')  
     signup=await client.db('signup')
     if(signup)
     collec=await signup.collection('username')
     stock=await signup.collection('stock')
     if(stock)
       console.log('stock is created')
     if(collec)
     console.log('data created ppp' );
     collec2=await signup.collection('summma');
     if(collec2)
       console.log('is createed')
     
}
dbconnect()

let a='';
app.get('/',(req,res)=>{
   let a=req.query.status
    res.render('signup',{a});
})

app.post('/signdata',async (req,res)=>{
 
  let email=req.body.email;
  let pass=req.body.pass;
  let pass1=req.body.lpass;
  let result = pass.localeCompare(pass1);
  let r={email:email,pass:pass,cpass:pass1};
  let checkdata=await collec.countDocuments({email:email})
  console.log(checkdata)
  if(email.endsWith('@kongu.edu'))
   return res.redirect('/?status=dont use college mail');
  else if(!email.endsWith('@gmail.com'))
   return res.redirect('/?status=enter a valid mail');
  else if(result==1|| result==-1){
   return res.redirect('/?status=check our password')
  }
  else if(checkdata!=0){
    return res.redirect('/?status=email already taken');
  }
  else{
    await collec.insertOne(r);
    let pa="signup completely submitted"
    console.log("all ok")
    return res.render('login',{pa});
  }
})

app.get('/login',(req,res)=>{
  let b=req.query.status;
  console.log(b);
  return res.render('login',{b});
})


app.use(express.json())

app.post('/logindata', async (req,res)=>{
console.log(req.body.email1)
let email=req.body.email1;
let pass=req.body.pass1;
let y=await collec.find({email:email}).toArray();
let checkpas='';
console.log(y);
if(y.length!=0){
checkpas=y[0].pass;
}

if(checkpas==pass){
  return res.render('options');
}
else{
  return res.redirect('/login\?status=Invalid mail or password');
}
})


app.get('/bill',(req,res)=>{
  console.log('comes')
  const data=new Date();
  const d=data.getDate();
  const d1=data.getMonth()+1;
  const d2=data.getFullYear();
  const y=d+'-'+d1+'-'+d2;
  res.render('bill',{invoice:1,de:y})
})


app.get('/error',(req,res)=>{
  res.render('error')
})



app.post('/addstock', async (req,res)=>{
    
    let b=await stock.countDocuments({pname:req.body.pname})
    let vk=await stock.countDocuments({pname:req.body.pname,price:req.body.price});
    console.log('------');
    console.log(b);
    console.log(vk);
    if(b==0 ){
      console.log('new prooduct')
      let v={pname:req.body.pname,price:req.body.price,quantity:parseInt(req.body.quan)}
      await stock.insertOne(v);
    }
    else if(b!=vk){
      console.log('price changed product');
      stock.updateOne({pname:req.body.pname},{$set:{price:req.body.price}},{$inc:{quantity:parseInt(req.body.quan)}})
    }
    else{
       stock.updateOne({pname:req.body.pname},{$inc:{quantity:parseInt(req.body.quan)}})
       const s=await stock.find({},{pname:req.body.name})
        const st=await s.toArray();
        console.log(st);
       const ce=await stock.findOne({pname:req.body.pname});
       console.log('000000')
       
       const b = await stock.find({}, { projection: { _id: 0, pname: 1,quantity: 1,price:1} });
       const c=await b.toArray()
    }
   res.render('login')
})

app.post('/bill1',async (req,res)=>{
 let y=req.body.payload;
 console.log(y);
 let re=await stock.find({pname:{$regex:y+'.*', $options: 'i'}})
 let h=await re.toArray();
 let ye=[];
 let quan=0;
 h.forEach(element => {
  ye.push(element.pname);
  quan=element.quantity;
  console.log(quan);
  console.log(element.pname)
  });
 let message='ok';
 return res.send({payload:ye,message,quan:20});
})


app.post('/quan',async (req,res)=>{
  const ap=req.body.pname;
  const p=await stock.find({pname:ap},{pname:1}).toArray();
  let ar=[]
  let b;
  p.forEach(element => {
    ar.push(element.pname)
    b=parseInt(element.quantity);
  });
  let r=req.body.quanti<=b
  return res.send({p:ap,arr:ar,bool:r});
})



app.get('/op',async (req,res)=>{
  const a=(req.query.st).split(',');
  const b=(req.query.st1).split(',');
  for(var i=0;i<a.length;i++){
    const p=await stock.findOne({pname:a[i]},{quantity:1});
    const op=(p.quantity-b[i]);
    await stock.updateOne({pname:a[i]},{$set:{quantity:op}});
  }
  return res.render('bill',{pk:'succesfully'})
})


//enter a company
app.get('/addcompany',(req,res)=>{
  return res.render('addcompany')
})

app.post('/add',async (req,res)=>{
  const y=await signup.listCollections({name:String(req.body.companyname)}).toArray();
  const y1=await signup.collection('companyDetails');
  if(y.length!=0){
    return res.render('error',{message1:'sorry please check tis company available in our account'});
  }
  else{
    await signup.createCollection(String(req.body.companyname));
    const r=req.body.companyname;
    const r1=req.body.gst;
    const r2=req.body.address;
    const r3=req.body.pin;
    const r4=req.body.state;
    const data={comname:r,gstno:r1,address:r2,pin:r3,state:r4,alltot:0};
    y1.insertOne(data);
  }
  return res.render('error',{message:'new company was added'});
})


app.get('/company',async (req,res)=>{
  const r=req.query.e;
  const y=await signup.listCollections({name:{$regex:r,$options:'i'}}).toArray();
  let ar=[];
  y.forEach(element => {
    ar.push(element.name);
    console.log(element.name);
  });
  res.send({ar:ar});
}) 

app.get('/stock',async (req,res)=>{
      const u=  await signup.listCollections({name:String(req.query.y)}).toArray();
      if(u.length!=0){
        const add=await signup.collection('companyDetails').find({comname:String(req.query.y)}).toArray();
        const r=add[0].address.split(",");
        const p=add[0].gstno;
        const y=add[0].pin;
        const er=add[0].state;
        const ert=String(req.query.y);
        return res.render('stockentry',{name:req.query.y,invoice:req.query.y1,address:r,pin:y,state:er,gst:p});
      }
      else{
        return res.render('error',{pl:'our company is not our List'})
      }
})

app.get('/search',async (req,res)=>{
  const va= String(req.query.y)
  const check=await stock.find({pname:{$regex:va+'.*'}},{"pname":1,_id:0}).toArray();
  let ar=[];
  check.forEach(element => {
    //console,log(element.name)
    ar.push(element.pname);
  });
  return res.send({ar:ar});
})
app.get('/newbill',async (req,res)=>{
  const date=new Date();
  const date1=date.getDate();
  const mon=date.getMonth()+1;
  const year=date.getFullYear();
  const sendate=date1+'-'+mon+'-'+year;
  const y=await signup.collection('invoice').find({}).toArray();
  return res.render('newbill',{invoice:y.length,de:sendate})
})

app.get('/customers',async (req,res)=>{
 // console.log('=====')
  const u=String(req.query.e);
  const f=String(req.query.f);
  const u1=await signup.collection('customer').find({name:{$regex:u}}).toArray();
  const ar=[];
  console.log(f);
  if(f.localeCompare("customer")==0){
    console.log('000')
  u1.forEach(element => {
    console.log(element.name)
    ar.push(element.name)
  });
}
  else{
    console.log('=====')
    const u2=await signup.collection('customer').find({phone:{$regex: new RegExp("20", 'i')}}).toArray();
    u2.forEach(element => {
      ar.push(element.phone)
      
    });
  }
   res.send({ar:ar})
})


app.get('/cust',async (req,res)=>{
  const name=String(req.query.custname).trim();
  const phone=String(req.query.phone).trim();
  const total=parseInt(req.query.total);
  const p=String(req.query.pro).trim();
  const inv=String(req.query.i);
  const da=String(req.query.d);
  const q=req.query.quantity;
  console.log(req.query)
  console.log(inv+' '+da+' '+q+' '+p);
  const check=await signup.collection('customer').find({phone:phone}).toArray();
  const check1=await signup.collection('customer').find({name:name}).toArray();
  let rpp=p.split(",");
  let qpp=q.split(",");
  for(var i=0;i<rpp.length;i++){
    await stock.updateOne({pname:rpp[i]},{$inc:{quantity:-qpp[i]}})
  }
  let data={name:name,phone:phone,invoice:[inv],total:total}
   if(check.length==1 && check1.length==1){
    await signup.collection('customer').updateOne({name:name},{$inc:{total:total},$push:{invoice:inv}}) 
   }
   else{
    await signup.collection('customer').insertOne(data)
   }
   const y=await signup.listCollections({name:'invoice'}).toArray();

   if(y.length==0){
         const invo=signup.collection('invoice');
         const data={invoice:0,date:"0-0-0",product:[],quantity:[]}
         await invo.insertOne(data);
   }
   else{
        let r=q.split(',');
        let r1=p.split(',');
        const data={invoice:inv,date:da,product:r1,quantity:r,total:total};
        await signup.collection('invoice').insertOne(data);
   }
   return res.send({p:'success'})
})

app.get('/check',(req,res)=>{
  return res.render('checkprice')
})
app.get('/price',async (req,res)=>{
  console.log('opopo')
  const p=await stock.find({pname:String(req.query.e)}).toArray();
  const ar=[];
  if(p.length==0){
    return res.send({ok:'ok'})
  }
  p.forEach(element => {
    ar.push(element.price);
  });
  res.send({ar:ar})
})

app.get('/custdetails',async (req,res)=>{
  const y = await signup.collection('customer').find({}).toArray();
  const arr=[];
  const arr1=[];
  y.forEach(element => {
    arr.push(element.name)
    arr1.push(element.phone);
  }); 
  arr.forEach(element => {
    console.log(element)
  });
  return res.render('custdetails',{y});
})
app.post('/searchinvoice',async (req,res)=>{
  const r=await signup.collection('customer').find({phone:req.body.name}).toArray();
  const y=r[0].invoice;
  const t=r[0].total;
  for(var i=0;i<y.length;i++){
    console.log(y[i]);
  }
  return res.send({y:y,t:t});
})
app.get('/totalbill',async (req,res)=>{
  const ty=await signup.collection('invoice').find({}).toArray();
  let sells=0;
  ty.forEach(element => {
    sells+=element.total;
  });
  const up=await stock.find({}).toArray()
  var stockp=0;
  up.forEach(element => {
    stockp+=(element.quantity*element.price);
  });
  return res.render('total',{sells:sells,stockp:stockp,print:up});
})
app.get('/date',async(req,res)=>{
  const r=String(req.query.date).trim().split('-');
  const r1=r[0]+'-'+r[1]+'-'+r[2];
  console.log(r1);
  const u=await signup.collection('invoice').find({date:r1}).toArray();
  var tk=0;
  u.forEach(element => {
  tk+=element.total;  
  });
 return res.send({t:tk});
})

app.get('/print',async (req,res)=>{
  const r=req.query.r;
  const p=req.query.p;
  const y=req.query.y;
  const arr=y.split(',');
  const in1=req.query.in1;
  const d=req.query.d;
  const pin=req.query.zip;
  const prod=req.query.sno;
  console.log('opp'+prod);
  res.render('print',{r:r,p:p,y:arr,in1:in1,d:d,pin:pin})
})

//stock entry in database
app.post('/stockdata',async(req,res)=>{
    const company=req.body.name;
    const product=String(req.body.pr).split(',')
    const quantity=String(req.body.quantity).split(',');
    const rate=String(req.body.rate).split(',');
    const total=parseInt(req.body.total);
    const y=await signup.collection(company);
    const y1=await signup.collection(company).find({}).toArray();
    console.log('ppp'+total);
    let up=0;
    y1.forEach(element => {
      up=element.alltot;
    });
    up+=total;
    console.log(company)
    await signup.collection('companyDetails').updateOne({comname:String(company)},{$set:{alltot:up}})
    console.log(up);
    const data={invoice:String(req.body.invoice),product:product,quantity:quantity,rate:rate,total:total,alltot:up};
    y.insertOne(data);
    for(var i=0;i<product.length;i++){
      const r= await stock.find({pname:String(product[i])}).toArray();
      if(r.length!=0){
        await stock.updateOne({pname:product[i]},{$inc:{quantity:parseInt(quantity[i])}});
      }
      else{
        const data={pname:String(product[i]),price:parseInt(rate[i]),quantity:parseInt(quantity[i])}
        await stock.insertOne(data);
      }
    };
   

})
app.get('/copy',async(req,res)=>{
  var nameop='';
  var total1='';
  
  const arr=await signup.collection('companyDetails').find({}).toArray();
  arr.forEach(async (element)=> {
      nameop+=element.comname+',';
      total1+=element.alltot+',';
  });
  console.log(total1);
  return res.render('cop',{name:nameop,total:total1});
})
app.get('/balance',(req,res)=>{
  
  return res.render('balance')
})
app.listen(1000)