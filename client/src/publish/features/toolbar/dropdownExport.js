import React from 'react'

const DropdownExport = () => {
    return (
        <div className='flex flex-col dropdownExport'>
            <ul className='flex flex-col gap-4'>
                <li><a>Image (.png, .jpg)</a></li>
                <li><a>PDF (.pdf)</a></li>
                <li><a>BPMN (.bpmn)</a></li>
            </ul>
        </div>
    )
}

export default DropdownExport;