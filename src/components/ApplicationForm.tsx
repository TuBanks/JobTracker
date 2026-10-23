import { useState } from "react"
import type { Application } from "../types"

type ApplicationInfo = Omit<Application,"id">
type Status = Application["status"]

interface ApplicationProps{
    addApplication: (application:ApplicationInfo) => void,
}

function isValidStatus(value:string): value is Status{
  return ["Applied","Rejected","Interviewing","Offer"].includes(value)
}

function ApplicationForm({addApplication}:ApplicationProps){
    const [company,updateCompany] = useState<string>('')
    const [position,updatePosition] = useState<string>('')
    const [status,updateStatus] = useState<"Applied" | "Rejected" | "Interviewing" | "Offer">("Applied")
    const [date,updateDate] = useState<string>('')

    function updateField(field:string,value:string){
        switch (field){
        case 'company':
            updateCompany(value)
            break
        case 'position':
            updatePosition(value)
            break
        case 'status':
            if(isValidStatus(value)){
                updateStatus(value)
            }
            break
        case 'date':
            updateDate(value)
            break
        }
    }

    function submitForm(){
        const applicationInfo:ApplicationInfo = {
            company:company,
            position:position,
            status:status,
            date:date
        }
        addApplication(applicationInfo)
        updateCompany('')
        updatePosition('')
        updateStatus('Applied')
        updateDate('')
    }

    return(
        <div>
            <label>
                Company
                <input name = 'company' value={company} placeholder='Enter company here...' onChange={(e) => updateField(e.target.name,e.target.value)}/>
            </label>
            <label>
                Position
                <input name = 'position' value={position} placeholder='Enter position here...' onChange={(e) => updateField(e.target.name,e.target.value)}/>
            </label>
            <label>
                Status
                <select name='status' value={status} onChange={(e) => updateField(e.target.name,e.target.value)}>
                <option value = 'Applied'>Applied</option>
                <option value = 'Rejected'>Rejected</option>
                <option value = 'Interviewing'>Interviewing</option>
                <option value = 'Offer'>Offer</option>
                </select>
            </label>
            <label>
                Date
                <input type='date' name = 'date' value={date} onChange={(e) => updateField(e.target.name,e.target.value)}/>
            </label>
            <button onClick={()=>submitForm()}>Add</button>
        </div>
    )
}

export default ApplicationForm