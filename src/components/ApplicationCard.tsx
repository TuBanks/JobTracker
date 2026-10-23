function ApplicationCard({company,position,status}:{company:string;position:string;status:string}){
    return(
        <div>
            <h2>{company}</h2>
            <h3>{position}</h3>
            <p>{status}</p>
        </div>
    )
}

export default ApplicationCard