import {Pool} from "pg"
import { Application, ApplicationInfo,JobStatus } from "../shared/types"

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
        console.log("applications table exists or was created.")
    }
    catch(error){
        console.error("Error when init applications table",error)
    }
}

export async function insertApplication(pool:Pool,info:ApplicationInfo): Promise<Application>{
    try{
        const result = await pool.query(
            `INSERT INTO applications (company,position,status,date) VALUES ($1,$2,$3,$4) 
            RETURNING
            id,
            company,
            position,
            status,
            TO_CHAR(date, 'YYYY-MM-DD') as date;`,
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
            `DELETE FROM applications WHERE id = $1 RETURNING 
            id,
            company,
            position,
            status,
            TO_CHAR(date,'YYYY-MM-DD') as date;`,
            [id]
        )

        console.log(`Deleted ${result.rows[0]}`)

        if(result.rowCount !== null && result.rowCount !== 0){
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

export async function selectAllApplications(pool:Pool): Promise<Application[]>{
    try{
        const result = await pool.query(
            `SELECT
            id,
            company,
            position,
            status,
            TO_CHAR(date, 'YYYY-MM-DD') as date
            FROM applications;
            `
        )

        console.log(result.rows)

        return result.rows
    }
    catch(error){
        throw new Error(`SELECT * error`,{cause:error})
    }
}

export async function getApplication(pool:Pool,id:string): Promise<Application | undefined>{
    try{
        const result = await pool.query(
            `SELECT 
            id,
            company,
            position,
            status,
            TO_CHAR(date, 'YYYY-MM-DD') as date 
            FROM applications WHERE id=$1`,
            [id]
        )

        if(result.rowCount == 1){
            return result.rows[0]
        }
        else{
            return undefined
        }
    }
    catch(error){
        console.log("Failed to fetch application with id:",id)
        throw error
    }
}

export async function updateApplication(pool:Pool,
    id:string,
    fields:{company?:string,position?:string,status?:JobStatus,date?:string}
    ):Promise<Application | undefined>
    {

    try{
        let query = "UPDATE applications SET"
        let numFields = 1
        const queryParams:(string | undefined)[] = [...Object.values(fields),id]
        for(let field in fields){
            const setQuery = ` ${field} = $${numFields},`
            query = query.concat(" ",setQuery)
            numFields += 1
        }
        query = query.slice(0,-1)
        query = query.concat("",` WHERE id = $${numFields} RETURNING
            id,
            company,
            position,
            status,
            TO_CHAR(date, 'YYYY-MM-DD') as date;
            `)
        const result = await pool.query(
            query,
            queryParams
        )

        if(result.rowCount == 1){
            console.log("UPDATE: Update successful")
            return result.rows[0]
        }
        else{
            console.log("UPDATE: Application with id not found")
            return undefined
        }

    }
    catch(error){
        throw error
    }

}




