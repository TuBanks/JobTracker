import express from 'express'
import cors from "cors"
import {Pool, PoolConfig} from "pg"
import {app,pool} from "./app"
import {createApplicationsTable} from './db-operations'

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
