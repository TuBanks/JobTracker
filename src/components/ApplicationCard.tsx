function ApplicationCard({company,position,status,date}:{company:string;position:string;status:string;date:string}){
    
    return(
        <div>
            <h2>{company}</h2>
            <h3>{position}</h3>
            <p>{date}</p>
            <p>{status}</p>
            
        </div>
    )
}

export default ApplicationCard