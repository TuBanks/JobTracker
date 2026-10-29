import express from 'express'
import cors from "cors"
import {Pool, PoolConfig} from "pg"
import {success, uuid, z} from "zod"
import type {Application,ApplicationInfo} from '../shared/types'
import { insertApplication,deleteApplication,selectAllApplications,getApplication,updateApplication} from './db-operations'
import { equal } from 'assert'

export function createApp(pool:Pool){

    const app = express()
    app.use(express.json())

    app.use(cors({
    origin:"http://localhost:5173"
    }))

    const applicationSchema = z.object({
    company: z.string().trim().min(1).max(200),
    position: z.string().trim().min(1).max(200),
    status: z.enum([
        "Applied",
        "Interviewing",
        "Rejected",
        "Offer"
    ]),
    date: z.iso.date(),
    })

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

    app.get(`/api/applications/:id`,async (req,res) =>{
        const result = z.object({
            id:z.uuid()
        }).safeParse(req.params)
        if(result.success){
            const data = result.data
            const id = data.id
            try{
                const application = await getApplication(pool,data.id)

                if(application){
                    console.log("GET application success")
                    res.status(200).json(application)
                }
                else{
                    console.log("GET application not found")
                    res.status(404).send()
                }
            }
            catch(error){
                console.error("Unexpected database error",error)
                res.status(500).send()
            }
            
        }
        else{
            console.log("Get failed: invalid id format")
            res.status(400).send()
        }
    })

    app.post("/api/applications", async (req,res) =>{
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
                res.status(201).json(application)
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

        app.delete("/api/applications/:id",async (req,res) =>{
        const result = z.object({
            id: z.uuid()
        }).safeParse(req.params)
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
            console.log("Failed to remove application: invalid id format")
            res.status(400).send()
        }
    })

    const patchSchema = applicationSchema.partial().refine(
        (data)=> Object.keys(data).length > 0,
        {message: "Minimum 1 field must be provided to update an application."}
    )

    app.patch(`/api/applications/:id`,async (req,res)=>{
        const idResult = z.object({
            id:z.uuid()
        }).safeParse(req.params)

        const result = patchSchema.safeParse(req.body)
        if (idResult.success && result.success){
            const id = idResult.data.id
            const fields = result.data
            try{
                const application = await updateApplication(pool,id,fields)

                if(application !== undefined){
                    res.status(200).json(application)
                }
                else{
                    res.status(404).send()
                }

            }
            catch(error){
                console.error("UPDATE: Unexpected database error when updating.",error)
                res.status(500).send()
            }
        }
        else{
            console.log("UPDATE: Invalid patch format, need valid id and fields.")
            res.status(400).send()
        }
    })

    return app

}