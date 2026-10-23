import { useState } from 'react'
import { useEffect } from 'react'
import ApplicationHeader from './components/ApplicationHeader'
import ApplicationCard from './components/ApplicationCard'
import ApplicationForm from './components/ApplicationForm'
import type {Application} from '../shared/types'
import './App.css'

type ApplicationInfo = Omit<Application,"id">

async function fetchApplications(): Promise<Application[] | undefined> {
  try{
    const response = await fetch("http://localhost:3000/api/applications")

    if (!response.ok){
      throw new Error(`HTTP error: ${response.status}`)
    }

    const data = await response.json()

    if(Array.isArray(data)){
      return data
    }
  }
  catch(error){
    console.error("Failed to fetch applications", error)
    throw error
  }
}


function App() {
  const [applications,updateApplications] = useState<Application[]>([])

  useEffect(()=>{
    async function fetchAndUpdateApplications(){
      const fetchedApplications = await fetchApplications()
      if (fetchedApplications != undefined){
        updateApplications(fetchedApplications)
      }

    }

    fetchAndUpdateApplications()
    
  },[])

  function addApplication(application:ApplicationInfo){
    const id:string = crypto.randomUUID()
    const newApp:Application = {
      id:id,
      company:application.company.trim(),
      position:application.position.trim(),
      status:application.status,
      date:application.date
    }
    
    updateApplications(prevApplications => [...prevApplications,newApp])
      
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
    </div>

  )

}
export default App
