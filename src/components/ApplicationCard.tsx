import type { JobStatus, Application } from "../../shared/types";
import { useState } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription
} from "@/components/ui/popover"

import { Input } from "@/components/ui/input"

import {Button} from "@/components/ui/button"
import {Badge,badgeVariants} from "@/components/ui/badge"
import { setDate, toDate } from "date-fns";

type EditFields = {company?:string,position?:string,status?:JobStatus,date?:string}

interface ApplicatioCardProps{
    id:string
    company:string,
    position:string,
    status:JobStatus,
    date:string,
    editApplication:(id:string,fields:EditFields,remove?:boolean) => void
}

function dateValueToDate(date:string){
    const [year,month,day] = date.split("-").map(Number)
    return new Date(year,month-1,day)
}

const selectItems = [
    {label: "Applied",value: "Applied"},
    {label: "Rejected",value: "Rejected"},
    {label: "Interviewing",value: "Interviewing"},
    {label: "Offer",value: "Offer"},
]

const badgeColors = {
    Applied: "",
    Interviewing: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    Rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    Offer: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
}

function ApplicationCard({id,company,position,status,date,editApplication}:ApplicatioCardProps){

    const [editing,setEditing] = useState<boolean>(false)
    const [companyValue,setCompanyValue] = useState<string>(company)
    const [positionValue,setPositionValue] = useState<string>(position)
    const [statusValue,setStatusValue] = useState<JobStatus>(status)
    const [dateValue,setDateValue] = useState<string>(date)
    const [badgeColor,setBadgeColor] = useState<string>(badgeColors[status])

    const [currCompany,setCurrCompany] = useState<string>(company)
    const [currPosition,setCurrPosition] = useState<string>(position)
    const [currStatus,setCurrStatus] = useState<JobStatus>(status)
    const [currDate,setCurrDate] = useState<string>(date)

    function applyChanges(){
        setEditing(false)
        let fields:EditFields = {}
        if(companyValue !== company){
            fields.company = companyValue
        }
        if(positionValue !== position){
            fields.position = positionValue
        }
        if(statusValue !== status){
            fields.status = statusValue
        }
        if(dateValue !== date){
            fields.date == dateValue
        }
        async function asyncChanges(id:string,fields:EditFields){
            try{
            const response = await editApplication(id,fields)

            if(response == undefined){
                return
            }

            const application:Application = response
            setCurrCompany(application.company)
            setCurrPosition(application.position)
            setCurrStatus(application.status)
            setCurrDate(application.date)
        }
        catch(error){
            console.error(error)
        }
        }
        asyncChanges(id,fields)

    }

    return(
        <Card size="sm" className="mx-auto w-full max-w-xs">
            <CardHeader>
                {editing ? (
                    <Input placeholder={company} value={companyValue} onChange={(e)=>(setCompanyValue(e.target.value))}/>
                ): (
                    <CardTitle> {currCompany} </CardTitle>
                )}
                {editing ? (
                    <Input placeholder={position} value={positionValue} onChange={(e)=>(setPositionValue(e.target.value))}/>
                ): (
                    <CardDescription> {currPosition} </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                {editing ? (
                    <Select defaultValue={currStatus} onValueChange={(newStatus)=>{
                        if(newStatus){
                            setStatusValue(newStatus)
                            setBadgeColor(badgeColors[newStatus])
                        }
                    }}>
                        <SelectTrigger className={`${badgeVariants({variant:"default"})} ${badgeColor} w-fit`}>
                            <SelectValue placeholder={statusValue}/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {selectItems.map((item)=>(
                                    <SelectItem key={item.value} value={item.value} >{item.label}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                ):(
                    <Badge className={badgeColor} variant="default" > {currStatus} </Badge>
                )}
            </CardContent>
            <CardFooter>
                {editing ? (
                    <div className="flex w-full justify-between">
                        <Field>
                            <FieldLabel htmlFor="date-picker">
                                <Popover>
                                    <PopoverTrigger
                                        render={
                                            <Button variant="outline" id="date-picker" className="justify-start font-normal">
                                                {dateValue}
                                            </Button>
                                        }
                                    />
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dateValueToDate(dateValue)}
                                            onSelect={(newDate)=>{{
                                                if(newDate){
                                                    setDateValue(`${newDate.getFullYear()}-${newDate.getMonth()+1}-${newDate.getDate()}`)
                                                }
                                                
                                            }}}
                                            defaultMonth={toDate(date)}

                                        />
                                    </PopoverContent>
                                </Popover>
                            </FieldLabel>
                        </Field>
                        <Popover>
                            <PopoverTrigger render={<Button variant="destructive"/>}>
                                Delete
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverHeader>
                                    <PopoverTitle>Delete this application?</PopoverTitle>
                                    <PopoverDescription>This action is irreversible.</PopoverDescription>
                                    <Button onClick={()=>editApplication(id,{},true)}>Confirm</Button>
                                </PopoverHeader>
                            </PopoverContent>
                        </Popover>
                        <Button onClick={()=>applyChanges()}> Apply </Button>
                    </div>
                ):(
                    <div className="flex w-full justify-between">
                        <CardDescription> {currDate} </CardDescription>
                        <Button onClick={()=>{setEditing(true)}}> Edit </Button>
                    </div>
                )}

            </CardFooter>

        </Card>
    )
}

export default ApplicationCard