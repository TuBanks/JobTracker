import request from "supertest"
import {describe,it,expect} from "vitest"
import {app} from "./app"

describe("getRequests", ()=>{
    it("getAllApplications", async ()=>{
        const response = await request(app).get("/api/applications")

        expect(response.status).toBe(200)
    })
})


