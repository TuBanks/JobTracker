import { useState } from "react"
import type { Application } from "../../shared/types"

type ApplicationInfo = Omit<Application,"id">
type Status = Application["status"]

interface ApplicationProps{
    addApplication: (application:ApplicationInfo) => void,
}

function isValidStatus(value:string): value is Status{
  return ["Applied","Rejected","Interviewing","Offer"].includes(value)
}

function isValidApplicationInfo(application:ApplicationInfo):{message:string,valid:boolean}{
    let valid = true
    let errorMessage = ''
    if (application.company.trim().length == 0){
        errorMessage = 'Company name must be atleast 1 character long.'
        valid = false
    }
    else if(application.position.trim().length == 0){
        errorMessage = 'Position must be atleast 1 character long.'
        valid = false
    }
    else if(application.date.trim().length == 0){
        errorMessage = 'Please enter an application date.'
        valid = false
    }

    return {message:errorMessage,valid:valid}
}

function ApplicationForm({addApplication}:ApplicationProps){
    const [company,updateCompany] = useState<string>('')
    const [position,updatePosition] = useState<string>('')
    const [status,updateStatus] = useState<"Applied" | "Rejected" | "Interviewing" | "Offer">("Applied")
    const [date,updateDate] = useState<string>('')
    const [inputErrorMessage,updateInputErrorMessage] = useState<string>('')

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

        const result = isValidApplicationInfo(applicationInfo)
        if(result.valid){
            updateInputErrorMessage('')
            addApplication(applicationInfo)
            updateCompany('')
            updatePosition('')
            updateStatus('Applied')
            updateDate('')
        }
        else{
            updateInputErrorMessage(result.message)
        }
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
            {inputErrorMessage != '' && <p color='red'>{inputErrorMessage}</p>}
        </div>
    )
}

export default ApplicationForm