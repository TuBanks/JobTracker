import { useState } from 'react'
import { useEffect } from 'react'
import {Routes,Route,Navigate} from 'react-router'
import type {Application} from '../shared/types'
import Applications from "./pages/applications"
import Login from "./pages/login"
import './App.css'

async function fetchApplications(): Promise<Application[] | undefined> {
  try{
    const response = await fetch("http://localhost:3000/api/applications",{
      method:"GET",
      credentials:"include"
    })

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
  const [applications,updateApplications] = useState<Application[] | undefined>(undefined)

  useEffect(()=>{
    async function fetchAndUpdateApplications(){
      const fetchedApplications = await fetchApplications()
      if (fetchedApplications != undefined){
        updateApplications(fetchedApplications)
      }

    }

    fetchAndUpdateApplications()
    
  },[])

  return(
    <Routes>
      <Route path ="/" element={
        applications ? (
          <Navigate to={"/applications"}/>
        ):
        (
          <Navigate to={"/login"}/>
        )
      }/>
      <Route path="/applications" element={
        applications ? (
          <Applications applicationList={applications}/>
        ):
        (
          <Navigate to="/login"/>
        )
      }/>
      <Route path="/login" element={<Login/>}/>

    </Routes>
  )

}
export default App
