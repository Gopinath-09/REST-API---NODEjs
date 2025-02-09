//Toggle Example

import { useState } from "react"

const initialToggle = false

export default function UseStateHook(){
    const [toggle, setToggle] = useState(initialToggle);

    let toggleButton = () =>{
        setToggle(!toggle);
    }

    return <div>
        <button onClick={toggleButton}>TOGGLE</button>
        {toggle ? <span>F**k u!</span> : <span>&lt;-- Click to Show</span>}
    </div>
}