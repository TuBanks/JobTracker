import express from 'express'
import cors from "cors"
import {success, z} from "zod"

import type {Application} from '../shared/types'

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
  const applicationSchema = z.object({
    company: z.string(),
    position: z.string(),
    status: z.enum([
      "Applied",
      "Interviewing",
      "Rejected",
      "Offer"
    ]),
    date: z.iso.date(),
  })

  const result = applicationSchema.safeParse(req.body)
  if(result.success){
    if (req.body.company.trim().length > 0 && req.body.position.trim().length > 0){
      const id:string = crypto.randomUUID()
      const newApplication:Application = {
        id:id,
        company:req.body.company,
        position:req.body.position,
        status:req.body.status,
        date:req.body.date
      }
      sourceApplications.push(newApplication)
      console.log("Application added")
      console.log(sourceApplications)
      res.status(201).json({success:true,id:id})
    }
    else{
      console.log("Application invalid")
      res.status(200).json({success:false})
    }
  }
  else{
    console.log("Application invalid")
    res.status(200).json({success:false})

  }
    
  console.log("Attempted to add application.")
  
})

app.post("/api/remove-application",(req,res) =>{
  const result = z.object({
    id: z.string()
  }).safeParse(req.body)
  if(result.success){
    sourceApplications = sourceApplications.filter(item => (
      item.id !== req.body.id
    ))
    console.log("Application removed")
    res.status(201).json({success:true})
  }
  else{
    console.log("Failed to remove application")
    res.status(200).json({success:false})
  }
})

app.listen(3000, ()=>{
  console.log("Server listening on port 3000")
})