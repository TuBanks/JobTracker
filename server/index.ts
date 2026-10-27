import express from 'express'
import cors from "cors"
import {success, z} from "zod"
import {Pool, PoolConfig} from "pg"

import type {Application,ApplicationInfo} from '../shared/types'
import { insertApplication,deleteApplication,selectAllApplications, createApplicationsTable} from './db-operations'


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

app.get("/api/applications", async (req,res) => {
  try{
    const applications = await selectAllApplications(pool)
    res.status(200).json(applications)
    }
  catch(error){
    console.error("Unexpected database error:",error)
    res.status(500).send()
  }
})

app.post("/api/add-application", async (req,res) =>{

  const result = applicationSchema.safeParse(req.body)
  if(result.success){
    const data = result.data
    const newApplicationInfo:ApplicationInfo = {
      company:data.company,
      position:data.position,
      status:data.status,
      date:data.date
    }
    
    try{
      const application = await insertApplication(pool,newApplicationInfo)
      res.status(201).json({application:application})
    }
    catch(error){
      console.error("Unexpected database error:",error)
      res.status(500).send()
    }
    
  }
  else{
    console.log("Application invalid")
    res.status(400).send()

  }
  
})

app.delete("/api/remove-application",async (req,res) =>{
  const result = z.object({
    id: z.uuidv7()
  }).safeParse(req.body)
  if(result.success){
    const data = result.data
    const id = data.id
    
    try{
      const deletedApplication = await deleteApplication(pool,id)

      if(deletedApplication !== undefined){
        console.log(deletedApplication)
        res.status(200).json({
          id: deletedApplication.id
        })
      }
      else{
        res.status(404).send()
      }
    }
    catch(error){
      console.error("Unexpected database error:",error)
      res.status(500).send()
    }

  }
  else{
    console.log("Failed to remove application")
    res.status(400).send()
  }
})

async function initServer(pool:Pool){
  try{

    const result = await createApplicationsTable(pool)
    const test = await pool.query(
      "SELECT * FROM applications LIMIT 1;"
    )

    app.listen(3000, ()=>{
      console.log("Server listening on port 3000")
    })
  }
  catch(error){
    console.error("Server failed to start: database not in service",error)
    await pool.end()
  }
}

void initServer(pool)
