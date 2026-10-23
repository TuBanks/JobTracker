import { useState } from 'react'
import ApplicationHeader from './components/ApplicationHeader'
import ApplicationCard from './components/ApplicationCard'
import type {Application} from './types'
import './App.css'

type Status = Application["status"]

function isValidStatus(value:string): value is Status{
  return ["Applied","Rejected","Interviewing","Offer"].includes(value)
}

const sourceApplications:Application[] = [
  {id:'Company1',company:"Company1",position:"Associate Software Engineer",status:"Applied",date:"2026-10-21"},
  {id:'Company2',company:"Company2",position:"Entry-Level Software Engineer",status:"Applied",date:"2026-10-22"},
  {id:'Company3',company:"Company3",position:"Junior Software Engineer",status:"Applied",date:"2026-10-23"},
  {id:'Company4',company:"Company4",position:"Associate AI Engineer",status:"Applied",date:"2026-10-23"},
]

function App() {
  const [applications,updateApplications] = useState<Application[]>(sourceApplications)
  const [company,updateCompany] = useState<string>('')
  const [position,updatePosition] = useState<string>('')
  const [status,updateStatus] = useState<"Applied" | "Rejected" | "Interviewing" | "Offer">("Applied")
  const [date,updateDate] = useState<string>('')

  function addApplication(){
    const id:string = company.concat('',position)
    const newApp:Application = {id:id,company:company,position:position,status:status,date:date}
    updateApplications([...applications,newApp])
  }

  function removeApplication(id:string){
    updateApplications(prevApplications => prevApplications.filter(app => app.id !== id))
  }

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
  return(
    <div>
      <ApplicationHeader/>
      {applications.map(((application) => (
        <div>
          <ApplicationCard key={application.id} company={application.company} position={application.position} status={application.status} date={application.date}/>
          <button onClick={() => removeApplication(application.id)}>Remove</button>
        </div>
      )))}
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
        <button onClick={()=>addApplication()}>Add</button>
      </div>
    </div>

  )

}
export default App
