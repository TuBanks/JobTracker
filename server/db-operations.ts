import {Pool} from "pg"
import { Application, ApplicationInfo,JobStatus,User } from "../shared/types"

export async function createApplicationsTable(pool:Pool){
    try{
        const result = await pool.query(
            `CREATE TABLE IF NOT EXISTS applications(
                id UUID DEFAULT uuidv7() PRIMARY KEY,
                user_id UUID,
                company VARCHAR(200) NOT NULL,
                position VARCHAR(200) NOT NULL,
                status VARCHAR(20) NOT NULL CHECK(status = 'Applied' OR status = 'Interviewing' OR status = 'Rejected' OR status = 'Offer'),
                date DATE NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );`
        )
        console.log("TABLE (applications) exists or was created.")
    }
    catch(error){
        console.error("Error when init applications table",error)
    }
}

export async function createUsersTable(pool:Pool){
    try{
        const result = await pool.query(
            `
            CREATE TABLE IF NOT EXISTS users(
                id UUID DEFAULT uuidv7() PRIMARY KEY,
                email VARCHAR(200) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
            `
        )
        console.log("TABLE (users) exists or was created.")
    }
    catch(error){
        console.error("Error when init users table:",error)
    }
}

export async function createSessionsTable(pool:Pool){
    try{
        const result = await pool.query(`
            CREATE TABLE IF NOT EXISTS sessions(
                token_hash TEXT PRIMARY KEY,
                user_id UUID NOT NULL,
                expiration_date TIMESTAMPTZ NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            `
        )
        console.log("TABLE (sessions) exists or was created.")
    }
    catch(error){
        console.error("Error when init sessions table:",error)
    }
}

export async function insertUser(pool:Pool,email:string,hashedPassword:string): Promise<User | undefined>{
    try{
        const result = await pool.query(`
            INSERT INTO users (email,password_hash)
            VALUES ($1,$2)
            ON CONFLICT(email) DO NOTHING
            RETURNING *;
            `,
            [email,hashedPassword]
        )

        console.log(result.rows)
        if(result.rowCount !== null && result.rowCount == 1){
            return result.rows[0]
        }
        else{
            return undefined
        }
    }
    catch(error){
        throw new Error(`Database error when inserting new user:${email} , hash:${hashedPassword}`,{cause:error})
    }
}

export async function getHashedPasswordFromUser(pool:Pool,email:string): Promise<string | undefined>{
    try{
        const result = await pool.query(`
            SELECT password_hash
            FROM users
            WHERE email = $1;
            `,
            [email]
        )

        if(result.rowCount != null && result.rowCount == 1 && result.rows[0].password_hash){
            return result.rows[0].password_hash
        }
        else{
            return undefined
        }
    }
    catch(error){
        throw new Error(`Error retreiving password_hash from user with email:${email}`,{cause:error})
    }
}

export async function insertApplication(pool:Pool,userId:string,info:ApplicationInfo): Promise<Application | undefined>{
    try{
        const result = await pool.query(
            `INSERT INTO applications (userId,company,position,status,date) VALUES ($1,$2,$3,$4,$5) 
            ON CONFLICT (userId,company,position) DO NOTHING
            RETURNING
            id,
            company,
            position,
            status,
            TO_CHAR(date, 'YYYY-MM-DD') as date;`,
            [userId,info.company,info.position,info.status,info.date]
        )

        console.log(result.rows)
        if(result && result.rowCount == 1){
            return result.rows[0]
        }
        else{
            return undefined
        }
    }
    catch(error){
        throw new Error(`INSERT error`,{cause:error})
    }
}

export async function deleteApplication(pool:Pool,userId:string,id:string): Promise<Application | undefined>{
    try{
        const result = await pool.query(
            `DELETE FROM applications WHERE user_id = $1 AND id = $2 RETURNING 
            id,
            company,
            position,
            status,
            TO_CHAR(date,'YYYY-MM-DD') as date;`,
            [userId,id]
        )

        if(result.rowCount !== null && result.rowCount !== 0){
            console.log(`Deleted ${result.rows[0]}`)
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

export async function selectUserApplications(pool:Pool,userId:string): Promise<Application[] | undefined>{
    try{
        const result = await pool.query(
            `SELECT
            id,
            company,
            position,
            status,
            TO_CHAR(date, 'YYYY-MM-DD') as date
            FROM applications
            WHERE user_id = $1;
            `,
            [userId]
        )

        console.log(result.rows)
        if(result.rowCount){
            return result.rows
        }
        else{
            return undefined
        }
    }
    catch(error){
        throw new Error(`SELECT * error`,{cause:error})
    }
}

export async function getApplication(pool:Pool,userId:string,id:string): Promise<Application | undefined>{
    try{
        const result = await pool.query(
            `SELECT 
            id,
            company,
            position,
            status,
            TO_CHAR(date, 'YYYY-MM-DD') as date 
            FROM applications 
            WHERE id=$1 and user_id = $2
            `,
            [id,userId]
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




