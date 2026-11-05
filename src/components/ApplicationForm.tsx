import { useState } from "react"
import type { Application } from "../../shared/types"

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

type ApplicationInfo = Omit<Application,"id">
type Status = Application["status"]

interface ApplicationProps{
    addApplication: (application:ApplicationInfo) => Promise<{message?:string,success:boolean}>,
}

function isValidStatus(value:string): value is Status{
  return ["Applied","Rejected","Interviewing","Offer"].includes(value)
}

function isValidApplicationInfo(application:ApplicationInfo):{message:string,valid:boolean}{
    let valid = true
    let errorMessage = ''
    if (application.company.trim().length == 0){
        errorMessage = 'Company name must be atleast 1 character long.'
        valid = false
    }
    else if(application.position.trim().length == 0){
        errorMessage = 'Position must be atleast 1 character long.'
        valid = false
    }
    else if(application.date.trim().length == 0){
        errorMessage = 'Please enter an application date.'
        valid = false
    }

    return {message:errorMessage,valid:valid}
}

function ApplicationForm({addApplication}:ApplicationProps){
    const [company,setCompany] = useState<string>('')
    const [position,setPosition] = useState<string>('')
    const [status,setStatus] = useState<"Applied" | "Rejected" | "Interviewing" | "Offer">("Applied")
    const [date,setDate] = useState<string>("2026-10-28")
    const [badgeColor,setBadgeColor] = useState<string>(badgeColors["Applied"])
    const [popoverOpen,setPopoverOpen] = useState<boolean>(false)
    const [savingApplication,setSavingApplication] = useState<boolean>(false)
    const [inputErrorMessage,setInputErrorMessage] = useState<string>('')

    function updateField(field:string,value:string){
        switch (field){
        case 'company':
            setCompany(value)
            break
        case 'position':
            setPosition(value)
            break
        case 'status':
            if(isValidStatus(value)){
                setStatus(value)
            }
            break
        case 'date':
            setDate(value)
            break
        }
    }

    function addClicked(){
        const appInfo:ApplicationInfo = {
            company:company,
            position:position,
            status:status,
            date:date
        }

        const result = isValidApplicationInfo(appInfo)
        if(result.valid){
            setSavingApplication(true)
            async function submitForm(appInfo:ApplicationInfo){
                try{
                    const result = await addApplication(appInfo)
                    if(result.message){
                        setInputErrorMessage(result.message)
                    }
                    if(result.success){
                        setSavingApplication(false)
                        setPopoverOpen(false)
                        setInputErrorMessage('')
                        setCompany('')
                        setPosition('')
                        setStatus('Applied')
                        setDate('')
                    }
                }
                catch(error){
                    console.error("Error when adding application:",error)
                    setSavingApplication(false)
                }
            }
            submitForm(appInfo)
        }
        else{
            setInputErrorMessage(result.message)
        }
    }

    return(
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger render={<Button variant={'outline'}>Add Application</Button>}/>
            <PopoverContent>
                <Card size="sm" className="mx-auto w-full max-w-xs">
                            <CardHeader>
                                <Input placeholder={"Company"} value={company} onChange={(e)=>(setCompany(e.target.value))}/>
                                <Input placeholder={"Position"} value={position} onChange={(e)=>(setPosition(e.target.value))}/>
                            </CardHeader>
                            <CardContent>
                                    <Select defaultValue={status} onValueChange={(newStatus)=>{
                                        if(newStatus){
                                            setStatus(newStatus)
                                            setBadgeColor(badgeColors[newStatus])
                                        }
                                    }}>
                                        <SelectTrigger className={`${badgeVariants({variant:"default"})} ${badgeColor} w-fit`}>
                                            <SelectValue placeholder={"Applied"}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {selectItems.map((item)=>(
                                                    <SelectItem key={item.value} value={item.value} >{item.label}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                            </CardContent>
                            <CardFooter>
                                    <div className="flex w-full justify-between">
                                        <Field>
                                            <FieldLabel htmlFor="date-picker">
                                                <Popover>
                                                    <PopoverTrigger
                                                        render={
                                                            <Button variant="outline" id="date-picker" className="justify-start font-normal">
                                                                {date}
                                                            </Button>
                                                        }
                                                    />
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={dateValueToDate(date)}
                                                            onSelect={(newDate)=>{{
                                                                if(newDate){
                                                                    setDate(`${newDate.getFullYear()}-${String(newDate.getMonth()+1).padStart(2,"0")}-${String(newDate.getDate()).padStart(2,"0")}`)
                                                                }
                                                                
                                                            }}}
                                                            defaultMonth={toDate(date)}
                
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </FieldLabel>
                                        </Field>
                                        <Button onClick={()=>{
                                            addClicked()
                                            }}>
                                            {savingApplication ? (
                                                <Spinner/>
                                            ):(
                                                <div>Apply</div>
                                            )} 
                                        
                                        </Button>
                                    </div>
                            </CardFooter>
                            {inputErrorMessage != '' && <p color="red">{inputErrorMessage}</p>}
                        </Card>
            </PopoverContent>
        </Popover>
    )
}

export default ApplicationForm