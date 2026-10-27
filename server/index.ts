import express from 'express'
import cors from "cors"
import {Pool, PoolConfig} from "pg"
import {createApp} from "./app"
import {createApplicationsTable} from './db-operations'

const config:PoolConfig = {
  host: "localhost",
  port: 5432,
  database: "jobtracker",
  user: "tucker",
  max: 5,
  connectionTimeoutMillis: 5000
}

async function initServer(pool:Pool){
  try{

    const app = createApp(pool)

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
const pool = new Pool(config)
void initServer(pool)
