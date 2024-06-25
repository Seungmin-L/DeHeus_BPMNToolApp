import React from 'react';

function Toolbar({   
    onSave, 
    onZoomIn, 
    onZoomOut, 
    onUndo, 
    onRedo, 
    onPicture, 
    onAlignLeft, 
    onAlignCenter, 
    onAlignRight, 
    onAlignTop, 
    onAlignMiddle, 
    onAlignBottom, 
    onDistributeHorizontally, 
    onDistributeVertically 
}) {
  return (
    <div className="toolbar">
        <button onClick={onSave}>Save</button>
        <button onClick={onZoomIn}>Zoom In</button>
        <button onClick={onZoomOut}>Zoom Out</button>
        <button onClick={onUndo}>Undo</button>
        <button onClick={onRedo}>Redo</button>
        <button onClick={onPicture}>Picture</button>
        <button onClick={onAlignLeft}>Align Left</button>
        <button onClick={onAlignCenter}>Align Center</button>
        <button onClick={onAlignRight}>Align Right</button>
        <button onClick={onAlignTop}>Align Top</button>
        <button onClick={onAlignMiddle}>Align Middle</button>
        <button onClick={onAlignBottom}>Align Bottom</button>
        <button onClick={onDistributeHorizontally}>Distribute Horizontally</button>
        <button onClick={onDistributeVertically}>Distribute Vertically</button>
    </div>
  );
}

export default Toolbar;
