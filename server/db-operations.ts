import {Pool} from "pg"
import { Application, ApplicationInfo } from "../shared/types"

export async function createApplicationsTable(pool:Pool){
    try{
        const result = await pool.query(
            `CREATE TABLE IF NOT EXISTS applications(
                id UUID DEFAULT uuidv7() PRIMARY KEY,
                company VARCHAR(200) NOT NULL,
                position VARCHAR(200) NOT NULL,
                status VARCHAR(20) NOT NULL CHECK(status = 'Applied' OR status = 'Interviewing' OR status = 'Rejected' OR status = 'Offer'),
                date DATE NOT NULL
            );`
        )

        console.log(result.rowCount)
    }
    catch(error){
        console.error(error)
    }
}

export async function insertApplication(pool:Pool,info:ApplicationInfo): Promise<Application | undefined>{
    try{
        const result = await pool.query(
            "INSERT INTO applications (company,position,status,date) VALUES ($1,$2,$3,$4) RETURNING *;",
            [info.company,info.position,info.status,info.date]
        )

        console.log(result.rows)
        return result.rows[0]
    }
    catch(error){
        throw new Error(`INSERT error`,{cause:error})
    }
}

export async function deleteApplication(pool:Pool,id:string): Promise<Application | undefined>{
    try{
        const result = await pool.query(
            "DELETE FROM applications WHERE id = $1 RETURNING *",
            [id]
        )

        console.log(`Deleted ${result.rows[0]}`)

        if(result.rowCount !== null){
            return result.rows[0]
        }
        else{
            return undefined
        }

    }
    catch(error){
        throw new Error(`DELETE error`,{cause:error})
    }
}

export async function selectAllApplications(pool:Pool): Promise<Application[] | undefined>{
    try{
        const result = await pool.query(
            "SELECT * FROM applications"
        )

        console.log(result.rows)

        return result.rows
    }
    catch(error){
        throw new Error(`SELECT * error`,{cause:error})
    }
}

async function getApplication(){

}

async function updateApplication(){

}