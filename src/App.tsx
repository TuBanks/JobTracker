import { useState } from 'react'
import ApplicationHeader from './components/ApplicationHeader'
import ApplicationCard from './components/ApplicationCard'
import ApplicationForm from './components/ApplicationForm'
import type {Application} from './types'
import './App.css'

type ApplicationInfo = Omit<Application,"id">

const sourceApplications:Application[] = [
  {id:'Company1',company:"Company1",position:"Associate Software Engineer",status:"Applied",date:"2026-10-21"},
  {id:'Company2',company:"Company2",position:"Entry-Level Software Engineer",status:"Applied",date:"2026-10-22"},
  {id:'Company3',company:"Company3",position:"Junior Software Engineer",status:"Applied",date:"2026-10-23"},
  {id:'Company4',company:"Company4",position:"Associate AI Engineer",status:"Applied",date:"2026-10-23"},
]

function App() {
  const [applications,updateApplications] = useState<Application[]>(sourceApplications)

  const [inputErrorMessage,updateInputErrorMessage] = useState<string>('')

  
  function isValidApplication(application:Application):boolean{
    let valid = true
    if (application.company.trim().length == 0){
      updateInputErrorMessage('Company name must be atleast 1 character long.')
      valid = false
    }
    else if(application.position.trim().length == 0){
      updateInputErrorMessage('Position must be atleast 1 character long.')
      valid = false
    }
    else if(application.date.trim().length == 0){
      updateInputErrorMessage('Please enter an application date.')
      valid = false
    }

    return valid
  }

  function addApplication(application:ApplicationInfo){
    const id:string = crypto.randomUUID()
    const newApp:Application = {
      id:id,
      company:application.company.trim(),
      position:application.position.trim(),
      status:application.status,
      date:application.date
    }
    if(isValidApplication(newApp)){
      updateApplications(prevApplications => [...prevApplications,newApp])
      updateInputErrorMessage('')
    }
  }

  function removeApplication(id:string){
    updateApplications(prevApplications => prevApplications.filter(app => app.id !== id))
  }
  return(
    <div>
      <ApplicationHeader/>
      {applications.map(((application) => (
        <div key={application.id}>
          <ApplicationCard company={application.company} position={application.position} status={application.status} date={application.date}/>
          <button onClick={() => removeApplication(application.id)}>Remove</button>
        </div>
      )))}
      <ApplicationForm addApplication={addApplication}/>
      {inputErrorMessage != '' && <p color='red'>{inputErrorMessage}</p>}
    </div>

  )

}
export default App
