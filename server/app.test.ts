import request from "supertest"
import {describe,it,expect} from "vitest"
import {Pool, PoolConfig} from "pg"
import {createApp} from "./app"

const config:PoolConfig = {
  host: "localhost",
  port: 5432,
  database: "jobtracker",
  user: "tucker",
  max: 5,
  connectionTimeoutMillis: 5000
}

const pool = new Pool(config)

const app = createApp(pool)

describe("getRequests", ()=>{
    it("getAllApplications", async ()=>{
        const response = await request(app).get("/api/applications")

        expect(response.status).toBe(200)
    })
})


