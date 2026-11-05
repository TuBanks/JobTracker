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
import {Spinner} from "@/components/ui/spinner"

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
    editApplication:(id:string,fields:EditFields,remove?:boolean) => Promise<{message?:string,success:boolean}>
    removeApplication:(id:string) => void
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

function ApplicationCard({id,company,position,status,date,editApplication,removeApplication}:ApplicatioCardProps){

    const [editing,setEditing] = useState<boolean>(false)
    const [companyValue,setCompanyValue] = useState<string>(company)
    const [positionValue,setPositionValue] = useState<string>(position)
    const [statusValue,setStatusValue] = useState<JobStatus>(status)
    const [dateValue,setDateValue] = useState<string>(date)
    const [badgeColor,setBadgeColor] = useState<string>(badgeColors[status])
    const [saving,setSaving] = useState<boolean>(false)

    function applyChanges(){
        if(saving==true){
            return
        }
        setSaving(true)
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
            fields.date = dateValue
        }
        async function applyAsyncChanges(id:string,fields:EditFields){
            const response = await editApplication(id,fields)
            if(response.message){
                console.log(response.message)
            }
            if(response.success){
                setEditing(false)
            }

            setSaving(false)

        }

        applyAsyncChanges(id,fields)
        
    }

    function beginEditing(){
        setEditing(true)

        setCompanyValue(company)
        setPositionValue(position)
        setStatusValue(status)
        setDateValue(date)
    }
    return(
        <Card size="sm" className="mx-auto w-full max-w-xs">
            <CardHeader>
                {editing ? (
                    <Input placeholder={company} value={companyValue} onChange={(e)=>(setCompanyValue(e.target.value))}/>
                ): (
                    <CardTitle> {company} </CardTitle>
                )}
                {editing ? (
                    <Input placeholder={position} value={positionValue} onChange={(e)=>(setPositionValue(e.target.value))}/>
                ): (
                    <CardDescription> {position} </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                {editing ? (
                    <Select defaultValue={status} onValueChange={(newStatus)=>{
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
                    <Badge className={badgeColor} variant="default" > {status} </Badge>
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
                                                    setDateValue(`${newDate.getFullYear()}-${String(newDate.getMonth()+1).padStart(2,"0")}-${String(newDate.getDate()).padStart(2,"0")}`)
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
                                    <Button onClick={()=>removeApplication(id)}>Confirm</Button>
                                </PopoverHeader>
                            </PopoverContent>
                        </Popover>
                        <Button onClick={()=>applyChanges()}>
                            {saving ? (
                                <Spinner/>
                            ):(
                                <div>Apply</div>
                            )} 
                        
                        </Button>
                    </div>
                ):(
                    <div className="flex w-full justify-between">
                        <CardDescription> {date} </CardDescription>
                        <Button onClick={()=>beginEditing()}> Edit </Button>
                    </div>
                )}

            </CardFooter>

        </Card>
    )
}

export default ApplicationCard