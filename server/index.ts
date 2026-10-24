import express from 'express'
import cors from "cors"
import {success, z} from "zod"

import type {Application} from '../shared/types'

const applicationSchema = z.object({
  company: z.string().trim().min(1),
  position: z.string().trim().min(1),
  status: z.enum([
    "Applied",
    "Interviewing",
    "Rejected",
    "Offer"
  ]),
  date: z.iso.date(),
})

const app = express()
app.use(express.json())

app.use(cors({
  origin:"http://localhost:5173"
}))

let sourceApplications:Application[] = [
  {id:'Company1',company:"Company1",position:"Associate Software Engineer",status:"Applied",date:"2026-10-21"},
  {id:'Company2',company:"Company2",position:"Entry-Level Software Engineer",status:"Applied",date:"2026-10-22"},
  {id:'Company3',company:"Company3",position:"Junior Software Engineer",status:"Applied",date:"2026-10-23"},
  {id:'Company4',company:"Company4",position:"Associate AI Engineer",status:"Applied",date:"2026-10-23"},
]

app.get("/api/applications", (req,res) => {
    console.log("Attempted to fetch applications")
    res.json(sourceApplications)
})

app.post("/api/add-application", (req,res) =>{
  const result = applicationSchema.safeParse(req.body)
  if(result.success){
    const data = result.data
    const id:string = crypto.randomUUID()
    const newApplication:Application = {
      id:id,
      company:data.company,
      position:data.position,
      status:data.status,
      date:data.date
    }
    
    sourceApplications.push(newApplication)
    console.log("Application added")
    console.log(sourceApplications)
    res.status(201).json({success:true,application:newApplication})
    
  }
  else{
    console.log("Application invalid")
    res.status(400).json({success:false})

  }
  
})

app.delete("/api/remove-application",(req,res) =>{
  const result = z.object({
    id: z.string()
  }).safeParse(req.body)
  if(result.success){
    const data = result.data
    const idFound = sourceApplications.find(item => (
      item.id == data.id
    ))
    if(idFound == undefined){
      console.log("Application doesn't exist")
      res.status(400).json({success:false})
    }
    else{
      sourceApplications = sourceApplications.filter(item => (
      item.id !== data.id
    ))
    console.log("Application removed")
    res.status(200).json({success:true})
    }

  }
  else{
    console.log("Failed to remove application")
    res.status(400).json({success:false})
  }
})

app.listen(3000, ()=>{
  console.log("Server listening on port 3000")
})