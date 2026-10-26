import express from 'express'
import cors from "cors"
import {success, z} from "zod"
import {Pool, PoolConfig} from "pg"

import type {Application,ApplicationInfo} from '../shared/types'
import { insertApplication,deleteApplication,selectAllApplications} from './db-operations'


const config:PoolConfig = {
  host: "localhost",
  port: 5432,
  database: "jobtracker",
  user: "tucker",
  max: 5,
  connectionTimeoutMillis: 5000
}

const pool = new Pool(config)

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

app.get("/api/applications", (req,res) => {
    async function getAllApplications(pool:Pool){
      try{
        const applications = await selectAllApplications(pool)
        if(applications !== undefined){
          res.json(applications)
        }
        else{
          res.status(504)
        }
      }
      catch(error){
        console.error("Unexpected database error:",error)
      }
    }

    getAllApplications(pool)
})

app.post("/api/add-application", (req,res) =>{
  async function addApplication(pool:Pool,info:ApplicationInfo){
    try{
      const application = await insertApplication(pool,info)
      res.status(201).json({success:true,application:application})
    }
    catch(error){
      console.error("Unexpected database error:",error)
      res.status(400).json({success:false})
    }
  }
  const result = applicationSchema.safeParse(req.body)
  if(result.success){
    const data = result.data
    const id:string = crypto.randomUUID()
    const newApplicationInfo:ApplicationInfo = {
      company:data.company,
      position:data.position,
      status:data.status,
      date:data.date
    }
    
    addApplication(pool,newApplicationInfo)
    
  }
  else{
    console.log("Application invalid")
    res.status(400).json({success:false})

  }
  
})

app.delete("/api/remove-application",(req,res) =>{
  async function removeApplication(pool:Pool,id:string){
    try{
      const deletedApplication = await deleteApplication(pool,id)

      if(deletedApplication !== undefined){
        console.log(deletedApplication)
        res.status(200).json({
          success:true,
          id: deletedApplication.id
        })
      }
      else{
        res.status(404)
      }
    }
    catch(error){
      console.error("Unexpected database error:",error)
    }
  }
  const result = z.object({
    id: z.string()
  }).safeParse(req.body)
  if(result.success){
    const data = result.data
    const id = data.id
    
    removeApplication(pool,id)

  }
  else{
    console.log("Failed to remove application")
    res.status(400).json({success:false})
  }
})

app.listen(3000, ()=>{
  console.log("Server listening on port 3000")
})