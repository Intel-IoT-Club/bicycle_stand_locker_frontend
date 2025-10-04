import React from "react"
import { useState } from "react"
const Dropdown=({options=[],title})=>{

    const [isOpen,setOpen]=useState(false)
    const [isSelected,setSelected]=useState(0)
    
    return(
        
        <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
             <div className={`bg-black text-white ${isOpen ? "block" : "hidden"}`}>

            {options.map((option,index)=>{
                return <div key={index} className="text-white">{option}</div>
            })}
           
            </div>
        </div>
      
    )
}


export default Dropdown