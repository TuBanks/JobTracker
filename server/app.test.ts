import request from "supertest"
import {beforeAll,afterAll,afterEach,describe,it,expect} from "vitest"
import {Pool, PoolConfig} from "pg"
import {createApp} from "./app"
import { createApplicationsTable } from "./db-operations"

const config:PoolConfig = {
  host: "localhost",
  port: 5432,
  database: "jobtracker_test",
  user: "tucker",
  max: 5,
  connectionTimeoutMillis: 5000
}

const pool = new Pool(config)

const app = createApp(pool)

beforeAll(async ()=>{
    const response = await createApplicationsTable(pool)
})
afterEach(async ()=>{
    try{
        const response = await pool.query(
        "TRUNCATE TABLE applications;"
        )
    }
    catch(error){
        throw error
    }
})
afterAll(async ()=>{
    try{
        await pool.end()
        console.log("Pooled successfully closed.")
    }
    catch(error){
        throw error
    }
    
})

describe("Test get applications", ()=>{
    it("Get all applications, add one, get all again", async ()=>{
        const response = await request(app).get("/api/applications")

        expect(response.status).toBe(200)
        expect(response.body).toEqual([])

        const response2 = await request(app).post("/api/applications").send({
            company:"Google",
            position:"Software Developer",
            status:"Rejected",
            date:"2026-10-28",
        })
        expect(response2.status).toBe(201)
        expect(response2.body).toEqual({
            id: expect.any(String),
            company: "Google",
            position:"Software Developer",
            status:"Rejected",
            date:"2026-10-28"
        })

        const response3 = await request(app).get("/api/applications")
        expect(response3.status).toBe(200)
        expect(response3.body).toEqual([{
            id: expect.any(String),
            company: "Google",
            position:"Software Developer",
            status:"Rejected",
            date:"2026-10-28"
        }])
    })
})

describe("Test get application by id",()=>{
    it("Add application, get it by id", async()=>{
        const addResponse = await request(app).post("/api/applications").send({
            company:"Google",
            position:"Developer",
            status:"Applied",
            date:"2026-10-28"
        })

        expect(addResponse.status).toBe(201)
        expect(addResponse.body).toEqual({
            id: expect.any(String),
            company:"Google",
            position:"Developer",
            status:"Applied",
            date:"2026-10-28"
        })
        const id = addResponse.body.id
        const getResponse = await request(app).get(`/api/applications/${id}`)

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toEqual({
            id: id,
            company:"Google",
            position:"Developer",
            status:"Applied",
            date:"2026-10-28",
        })
    })
    it("Get invalid format id",async ()=>{
        const getResponse = await request(app).get("/api/applications/123")

        expect(getResponse.status).toBe(400)
    })
    it("Get non existing id",async ()=>{
        const id = "01a18363-ecdd-7401-b66f-d4dc2c8ab72d"
        const getResponse = await request(app).get(`/api/applications/${id}`)

        expect(getResponse.status).toBe(404)
    })
})

describe("Test adding invalid applications",()=>{
    it("Add short input field",async ()=>{
        const response = await request(app).post("/api/applications").send({
            company:"",
            position:"Developer",
            status:"Applied",
            date:"2026-10-28",
        })

        expect(response.status).toBe(400)
    })
    it("Add long input field name",async ()=>{
        let company_name = ""
        for(let i = 0;i<201;i++){
            company_name = company_name.concat("","a")
        }
        const response = await request(app).post("/api/applications").send({
            company:company_name,
            position:"Developer",
            status:"Applied",
            date:"2026-10-28",
        })

        expect(response.status).toBe(400)
    })

    it("Add invalid date",async ()=>{
        const response = await request(app).post("/api/applications").send({
            company:"Google",
            position:"Developer",
            status:"Applied",
            date:"2026/10/28",
        })

        expect(response.status).toBe(400)
    })
    it("Add invalid status",async ()=>{
        const response = await request(app).post("/api/applications").send({
            company:"Google",
            position:"Developer",
            status:"Applying",
            date:"2026-10-28",
        })

        expect(response.status).toBe(400)
    })
    it("Add invalid type for an input",async ()=>{
        const response = await request(app).post("/api/applications").send({
            company:1,
            position:"Developer",
            status:"Applied",
            date:"2026-10-28",
        })

        expect(response.status).toBe(400)
    })

})

describe("Test remove application route",()=>{
    it("Add one application, delete it, attempt to get it",async()=>{
        const addResponse = await request(app).post("/api/applications").send({
            company:"Google",
            position:"Developer",
            status:"Applied",
            date:"2026-10-28"
        })
        
        expect(addResponse.status).toBe(201)
        expect(addResponse.body).toEqual({
            id: expect.any(String),
            company:"Google",
            position:"Developer",
            status:"Applied",
            date:"2026-10-28",
        })

        const id = addResponse.body.id
        const deleteResponse = await request(app).delete(`/api/applications/${id}`)
        expect(deleteResponse.status).toBe(200)
        expect(deleteResponse.body.id).toEqual(id)

        const getResponse = await request(app).get(`/api/applications/${id}`)
        expect(getResponse.status).toBe(404)
    })

    it("delete a non existing id",async()=>{
        const id = "01a18363-ecdd-7401-b66f-d4dc2c8ab72d"
        const deleteResponse = await request(app).delete(`/api/applications/${id}`)

        expect(deleteResponse.status).toBe(404)
    })
    it("delete an invalid id format",async()=>{
        const id = "123"
        const deleteResponse = await request(app).delete(`/api/applications/${id}`)
        expect(deleteResponse.status).toBe(400)
    })
    
})

describe("Test patch route",()=>{
    it("Add application, update it, get it, delete it", async()=>{
        const addResponse = await request(app).post("/api/applications").send({
            company:"Google",
            position:"Developer",
            status:"Applied",
            date:"2026-10-28"
        })

        expect(addResponse.status).toBe(201)
        expect(addResponse.body).toEqual({
            id: expect.any(String),
            company:"Google",
            position:"Developer",
            status:"Applied",
            date:"2026-10-28",
        })

        const id = addResponse.body.id
        const updateResponse = await request(app).patch(`/api/applications/${id}`).send({
            status:"Rejected",
        })
        
        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toEqual({
            id:id,
            company:"Google",
            position:"Developer",
            status:"Rejected",
            date:"2026-10-28"
        })

        const getResponse = await request(app).get(`/api/applications/${id}`)
        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toEqual({
            id:id,
            company:"Google",
            position:"Developer",
            status:"Rejected",
            date:"2026-10-28"
        })

        const deleteResponse = await request(app).delete(`/api/applications/${id}`)
        expect(deleteResponse.status).toBe(200)
        expect(deleteResponse.body).toEqual({id})
    })
})


