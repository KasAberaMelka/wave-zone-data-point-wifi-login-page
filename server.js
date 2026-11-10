const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const BUSINESS_NAME = "WAVE ZONE DATA POINT";
const SUPPORT_PHONE = "0748594346";
const RECEIVER_PHONE = process.env.RECEIVER_PHONE;

const MTN_SUBSCRIPTION_KEY = process.env.MTN_SUBSCRIPTION_KEY;
const MTN_API_USER = process.env.MTN_API_USER;
const MTN_API_KEY = process.env.MTN_API_KEY;
const AIRTEL_CLIENT_ID = process.env.AIRTEL_CLIENT_ID;
const AIRTEL_CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET;

const PACKAGES = { "7HOURS":500, "DAILY":1000, "3DAYS":2200, "WEEKLY":4500 };
const PACKAGE_NAMES = { "7HOURS":"7 HOURS","DAILY":"DAILY","3DAYS":"3 DAYS","WEEKLY":"WEEKLY" };
const PACKAGE_HOURS = { "7HOURS":7, "DAILY":24, "3DAYS":72, "WEEKLY":168 };

let vouchers = {};

app.get("/", (req,res)=> res.send("WAVE ZONE DATA POINT Backend Running - "+BUSINESS_NAME));

app.post("/pay", async (req,res)=>{
  const {phone, package:pkg, amount, email, network, mac} = req.body;
  if(!PACKAGES[pkg] || PACKAGES[pkg]!==amount) return res.json({error:"Invalid package"});
  if(!phone || phone.length!==10) return res.json({error:"Invalid phone"});

  let provider = network || "MTN";
  if(phone.startsWith("070")||phone.startsWith("075")) provider="AIRTEL";
  if(phone.startsWith("076")||phone.startsWith("077")||phone.startsWith("078")) provider="MTN";

  const reference = "WAVEZONE-"+Date.now();
  console.log(`PAY via ${provider} -> ${BUSINESS_NAME} -> Receiver ${RECEIVER_PHONE} | Customer ${phone} | ${pkg} | UGX ${amount} | Ref ${reference} | MAC ${mac||""}`);

  try{
    const voucher = String(Math.floor(1000000000 + Math.random()*8999999999));
    const hours = PACKAGE_HOURS[pkg];
    vouchers[voucher]={phone, package:pkg, packageName:PACKAGE_NAMES[pkg], amount, email, network:provider, reference, mac, expiresAt: Date.now()+hours*60*60*1000, createdAt: Date.now()};
    res.json({success:true, voucher, network:provider, reference});
  }catch(e){ console.log(e); res.json({error:"Payment failed, try again"}); }
});

app.post("/check-voucher", (req,res)=>{
  const {voucher}=req.body;
  const v=vouchers[voucher];
  if(!v) return res.json({valid:false});
  if(Date.now()>v.expiresAt) return res.json({valid:false, expired:true});
  res.json({valid:true, ...v, remainingMs: v.expiresAt-Date.now()});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("WAVE ZONE Backend on "+PORT));
