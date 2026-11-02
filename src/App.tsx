import { useState } from 'react'
import { useEffect } from 'react'
import ApplicationHeader from './components/ApplicationHeader'
import ApplicationCard from './components/ApplicationCard'
import ApplicationForm from './components/ApplicationForm'
import type {Application,ApplicationInfo,JobStatus} from '../shared/types'
import './App.css'

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

        if(response.status == 201){
          const newApp:Application = data
          updateApplications(prevApplications => [...prevApplications,newApp])
        }
      }
      catch(error){
        throw error
      }
    }

    postApplication(newAppInfo)
      
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
    fields:{company?:string,position?:string,status?:JobStatus,date?:string},
    remove?:boolean
    ):Promise<Application | undefined>{
      if(remove == true){
        removeApplication(id)
        return
      }
      if(Object.keys(fields).length < 1){
        console.log("No application fields changed.")
        return
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

        const application:Application = await response.json()

        return application
      

      }
      catch(error){
        console.error("Unexpected error when patching",error)
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
export default App
