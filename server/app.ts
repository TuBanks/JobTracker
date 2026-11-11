import express from 'express'
import { Request,Response,NextFunction } from 'express'
import cookieParser from "cookie-parser"
import cors from "cors"
import {Pool, PoolConfig} from "pg"
import {success, uuid, z} from "zod"
import * as argon2 from 'argon2'
import type {Application,ApplicationInfo} from '../shared/types'
import { insertUser,insertApplication,deleteApplication,selectUserApplications,getApplication,updateApplication, getHashedPasswordFromUser} from './db-operations'
import { randomBytes,createHash } from 'crypto'

export function createApp(pool:Pool){

    const app = express()
    app.use(express.json())
    app.use(cookieParser())

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

    const patchSchema = applicationSchema.partial().refine(
        (data)=> Object.keys(data).length > 0,
        {message: "Minimum 1 field must be provided to update an application."}
    ).strict()

    function hashToken(token:string):string{
        const hashedToken = createHash("sha256").update(token).digest("hex")
        return hashedToken
    }

    async function createSession(pool:Pool,email:string):Promise<string | undefined>{
        const token = randomBytes(32).toString("hex")
        const hashedToken = hashToken(token)
        try{
            const result = await pool.query(`
                INSERT INTO sessions (token_hash,user_id,expiration_date)
                SELECT $1,id,NOW() + INTERVAL '7 DAYS' FROM users
                WHERE email = $2
                RETURNING user_id;
                `,
                [hashedToken,email]
            )

            if(result && result.rowCount == 1){
                return token
            }
            else{
                return undefined
            }
        }
        catch(error){
            throw new Error("Error when inserting into sessions",{cause:error})
        }
    }

    async function getUserIdFromSession(pool:Pool,token:string):Promise<string | undefined>{
        const hashedToken = hashToken(token)
        try{
            const result = await pool.query(`
                SELECT user_id,expiration_date
                FROM sessions
                WHERE token_hash = $1;
                `,
                [hashedToken]
            )

            if(result && result.rowCount == 1){
                if(result.rows[0].expiration_date <= new Date()){
                    return undefined
                    // Add timestamp cleanup for expired sessions
                }
                return result.rows[0].user_id
            }
            else{
                return undefined
            }
        }
        catch(error){
            throw new Error("Unexpected error when finding session",{cause:error})
        }
    }

    async function authenticateSession(req:Request,res:Response,next:NextFunction):Promise<string|undefined>{
        const session: string|undefined = req.cookies.session
        if(!session){
            res.status(404).json({cause:"Session not found."})
            return
        }
        try{
            const userId = await getUserIdFromSession(pool,session)
            if(!userId){
                res.status(400).json({cause:"Invalid or expired session."})
                return
            }
            res.locals.userId = userId
            next()
        }
        catch(error){
            throw new Error("Unexpected error when authenticating user by session.",{cause:error})
        }

    }

    app.post("/api/register", async (req,res) =>{
        const result = z.object({
            email:z.string().min(3).toLowerCase(),
            password:z.string().min(3),
        }).safeParse(req.body)
        if(result.success){
            const data = result.data
            const email = data.email
            const password = data.password

            try{
                const hashedPassword = await argon2.hash(password, {
                    type: argon2.argon2id
                })

                const queryResponse = await insertUser(pool,email,hashedPassword)
                if(!queryResponse){
                    res.status(409).json({error:"User with email address already exists."})
                }

                res.status(201).send()
            }
            catch(error){
                console.error("Unexpected registration error:",error)
                res.status(500).json({cause:"Unexpected server error when registering."})
            }
        }
        else{
            res.status(400).json({error:"Invalid email or password."})
        }
    })

    app.post("/api/login", async (req,res) =>{
        const result = z.object({
            email:z.string().min(3).toLowerCase(),
            password:z.string().min(3)
        }).safeParse(req.body)
        if(result.success){
            const data = result.data
            const email = data.email
            const password = data.password

            try{
                const hashedPassword = await getHashedPasswordFromUser(pool,email)
                if(!hashedPassword){
                    res.status(404).json({cause:"Email not found."})
                    return
                }

                const isValid = await argon2.verify(hashedPassword,password)
                if(!isValid){
                    res.status(404).json({cause:"Incorrect password."})
                    return
                }
            }
            catch(error){
                console.error("Error when verifying password",error)
            }


            try{
                const sessionToken =  await createSession(pool,email)
                if(!sessionToken){
                    res.status(404).json({cause:"Session not found."})
                    return
                }

                res.status(201).cookie("session",sessionToken,{
                    httpOnly:true,
                    secure:false,
                    sameSite:"lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000
                }).json({message:"Login successful!"})


            }
            catch(error){
                console.error("Error when creating session",error)
                res.status(500).json({cause:"Unexpected server error during login."})
            }
        }
        else{
            res.status(400).json({cause:"Invalid email/password input."})
        }
    })

    app.get("/api/applications", authenticateSession,async (req,res) => {
        const userId:string = res.locals.userId
        try{
            const applications = await selectUserApplications(pool,userId)
            if(!applications){
                res.status(204).send()
                return
            }

            res.status(200).json(applications)

            }
        catch(error){
            console.error("Unexpected database error when getting applications:",error)
            res.status(500).send()
        }
    })

    app.get(`/api/applications/:id`,authenticateSession,async (req,res) =>{
        const userId = res.locals.userId
        const result = z.object({
            id:z.uuid()
        }).safeParse(req.params)
        if(result.success){
            const data = result.data
            const id = data.id
            try{
                const application = await getApplication(pool,userId,data.id)

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
                console.error("Unexpected database error when getting application by id:",error)
                res.status(500).send()
            }
            
        }
        else{
            console.log("Get failed: invalid id format")
            res.status(400).send()
        }
    })

    app.post("/api/applications", authenticateSession,async (req,res) =>{
        const userId = res.locals.userId
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
                const application = await insertApplication(pool,userId,newApplicationInfo)
                if(application){
                    res.status(201).json(application)
                }
                else{
                    res.status(409).json({cause:"Application already exists."})
                }
            }
            catch(error){
                console.error("Unexpected database error when posting application:",error)
                res.status(500).send()
            }
            
        }
        else{
            console.log("Application invalid")
            res.status(400).send()

        }
        
        })

        app.delete("/api/applications/:id",authenticateSession,async (req,res) =>{
            
            const userId = res.locals.userId
            const result = z.object({
                id: z.uuid()
            }).safeParse(req.params)
            if(result.success){
                const data = result.data
                const id = data.id
                
                try{
                const deletedApplication = await deleteApplication(pool,userId,id)

                if(deletedApplication){
                    console.log(deletedApplication)
                    res.status(200).json({
                        id: deletedApplication.id
                    })
                }
                else{
                    res.status(404).json({cause:"Application not found."})
                }
                }
                catch(error){
                    console.error("Unexpected database error when deleting application:",error)
                    res.status(500).send()
                }

            }
            else{
                console.log("Failed to remove application: invalid id format")
                res.status(400).send()
            }
    })

    app.patch(`/api/applications/:id`,authenticateSession,async (req,res)=>{
        const userId = res.locals.userId
        const idResult = z.object({
            id:z.uuid()
        }).safeParse(req.params)

        const result = patchSchema.safeParse(req.body)
        if (idResult.success && result.success){
            const id = idResult.data.id
            const fields = result.data
            try{
                const application = await updateApplication(pool,userId,id,fields)

                if(application !== undefined){
                    res.status(200).json(application)
                }
                else{
                    res.status(404).send()
                }

            }
            catch(error){
                console.error("Unexpected database error when updating.",error)
                res.status(500).send()
            }
        }
        else{
            console.log("Invalid patch format, need valid id and fields.")
            res.status(400).send()
        }
    })

    return app

}