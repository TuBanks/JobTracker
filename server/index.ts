import express from 'express'
import type {Application} from '../shared/types'

const app = express()

const sourceApplications:Application[] = [
  {id:'Company1',company:"Company1",position:"Associate Software Engineer",status:"Applied",date:"2026-10-21"},
  {id:'Company2',company:"Company2",position:"Entry-Level Software Engineer",status:"Applied",date:"2026-10-22"},
  {id:'Company3',company:"Company3",position:"Junior Software Engineer",status:"Applied",date:"2026-10-23"},
  {id:'Company4',company:"Company4",position:"Associate AI Engineer",status:"Applied",date:"2026-10-23"},
]

app.get("/api/applications", (req,res) => {
    res.json(sourceApplications)
})

app.listen(3000, ()=>{
})