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
    const newAppInfo:ApplicationInfo = {
      company:application.company.trim(),
      position:application.position.trim(),
      status:application.status,
      date:application.date
    }
    async function postApplication(appInfo:ApplicationInfo){
      try{
        const response = await fetch("http://localhost:3000/api/add-application",{
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

        if(response.status == 201){
          const newApp:Application = data.application
          updateApplications(prevApplications => [...prevApplications,newApp])
        }
      }
      catch(error){
        console.error("Failed to add application", error)
        throw error
      }
    }

    postApplication(newAppInfo)
      
  }

  function removeApplication(id:string){
    async function deleteApplication(id:string){
      try{
        const response = await fetch("http://localhost:3000/api/remove-application",{
          method:"DELETE",
          headers:{
            "Content-Type": "application/json"
          },
          body: JSON.stringify({id:id}),
        }
        )

        if(!response.ok){
          throw new Error(`HTTP error: ${response.status}`)
        }

        const data = await response.json()

        if(data.success){
          updateApplications(prevApplications => prevApplications.filter(app => app.id !== id))
        }

      }
      catch(error){
        console.error("Failed to remove application", error)
        throw error
      }
    }

    deleteApplication(id)
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
