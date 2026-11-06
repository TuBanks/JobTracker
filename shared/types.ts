export interface Application{
    id:string,
    company:string,
    position:string,
    status: "Applied" | "Rejected" | "Interviewing" | "Offer",
    date:string,
}

export interface User{
    id:string,
    email:string,
    password_hash:string,
}

export type ApplicationInfo = Omit<Application,"id">

export type JobStatus = "Applied" | "Rejected" | "Interviewing" | "Offer"