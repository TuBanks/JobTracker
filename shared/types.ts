export interface Application{
    id:string,
    company:string,
    position:string,
    status: "Applied" | "Rejected" | "Interviewing" | "Offer",
    date:string,
}

export type ApplicationInfo = Omit<Application,"id">