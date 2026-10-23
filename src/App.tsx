import ApplicationHeader from './components/ApplicationHeader'
import ApplicationCard from './components/ApplicationCard'
import './App.css'

const applications = [
  {id:1,company:"Company1",position:"Associate Software Engineer",status:"Applied",date:"10/21/2026"},
  {id:2,company:"Company2",position:"Entry-Level Software Engineer",status:"Applied",date:"10/22/2026"},
  {id:3,company:"Company3",position:"Junior Software Engineer",status:"Applied",date:"10/23/2026"},
  {id:4,company:"Company4",position:"Associate AI Engineer",status:"Applied",date:"10/23/2026"},
]

function App() {
  return(
    <div>
      <ApplicationHeader/>
      {applications.map(((application) => (
        <ApplicationCard key={application.id} company={application.company} position={application.position} status={application.status} date={application.date}/>
      )))}
    </div>

  )

}
export default App
