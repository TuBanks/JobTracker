import { useState } from 'react'
import ApplicationHeader from '../components/ApplicationHeader'
import ApplicationCard from '../components/ApplicationCard'
import ApplicationForm from '../components/ApplicationForm'
import type {Application,ApplicationInfo,JobStatus} from '../../shared/types'

type ApplicationProps = {
    applicationList:Application[]
}

export default function Applications({applicationList}:ApplicationProps){
    const [applications,updateApplications] = useState<Application[]>(applicationList)

    async function addApplication(application:ApplicationInfo):Promise<{message?:string,success:boolean}>{
        const appInfo:ApplicationInfo = {
            company:application.company.trim(),
            position:application.position.trim(),
            status:application.status,
            date:application.date
        }
        try{
        const response = await fetch("http://localhost:3000/api/applications",{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(appInfo)
        })

        if (!response.ok){
            throw new Error(`HTTP error: ${response.status}`)
        }

        const data = await response.json()

        if(data.id && data.company && data.position && data.status && data.date){
            const newApp:Application = data
            updateApplications(prevApplications => [...prevApplications,newApp])
            return {success:true}
        }

        return {message:"Unexpected JSON body error",success:false}
        }
        catch(error){
        console.error("Failed to add application:",error)
        return {message:"Unexpected error when adding application.",success:false}
        }
        
    }

    function removeApplication(id:string){
        async function deleteApplication(id:string){
        try{
            const response = await fetch(`http://localhost:3000/api/applications/${id}`,{
            method:"DELETE",
            headers:{
                "Content-Type": "application/json"
            },
            }
            )

            if(!response.ok){
            throw new Error(`HTTP error: ${response.status}`)
            }

            updateApplications(prevApplications => prevApplications.filter(app => app.id !== id))

        }
        catch(error){
            console.error("Failed to remove application", error)
        }
        }

        deleteApplication(id)
    }

    async function editApplication(
        id:string,
        fields:{company?:string,position?:string,status?:JobStatus,date?:string}
        ):Promise<{message?:string,success:boolean}>{
        if(Object.keys(fields).length < 1){
            console.log("No application fields changed.")
            return {message:"No application fields changed.",success:true}
        }
        let errorMessage = ""
        let valid = true
        if (fields.company?.trim().length == 0){
            errorMessage = 'Company name must be atleast 1 character long.'
            valid = false
        }
        else if(fields.position?.trim().length == 0){
            errorMessage = 'Position must be atleast 1 character long.'
            valid = false
        }
        else if(fields.date?.trim().length == 0){
            errorMessage = 'Please enter an application date.'
            valid = false
        }
        else if(fields.status && !["Applied","Rejected","Interviewing","Offer"].includes(fields.status)){
            errorMessage = 'Invalid status'
            valid = false
        }
        if(!valid){
            return {message:errorMessage,success:valid}
        }
        try{
            const response = await fetch(`http://localhost:3000/api/applications/${id}`,{
            method:"PATCH",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(fields)
            })

            if (!response.ok){
            throw new Error(`Failed to edit application. HTML status:${response.status}`)
            }

            const updatedApplication:Application = await response.json()

            updateApplications(prevApplications => prevApplications.map(item =>
            item.id === updatedApplication.id ? updatedApplication : item
            ))

            return {success:true}
        

        }
        catch(error){
            console.error("Unexpected error when patching",error)
            return {success:false}
        }
        
    }
    return(
        <div className="mx-auto max-w-6xl px-4">
        <ApplicationHeader/>
        <ApplicationForm addApplication={addApplication}/>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {applications.map(((application) => (
                <ApplicationCard 
                editApplication={editApplication} 
                removeApplication={removeApplication}
                key={application.id} id={application.id} 
                company={application.company} 
                position={application.position} 
                status={application.status} 
                date={application.date}/>
            )))}
        </div>
        </div>
    )
}