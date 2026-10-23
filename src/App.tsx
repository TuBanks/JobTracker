import ApplicationHeader from './components/ApplicationHeader'
import ApplicationCard from './components/ApplicationCard'
import './App.css'

function App() {
  return(
    <div>
      <ApplicationHeader/>
      <ApplicationCard company="Applied Systems" position="Associate Software Engineer / Software Engineer" status="Applied"/>
      <ApplicationCard company="Pariveda" position="Entry-Level Software Engineer" status="Applied"/>
      <ApplicationCard company="Unknown" position="CEO" status="Accepted"/>
    </div>

  )

}
export default App
