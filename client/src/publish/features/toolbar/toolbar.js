import React from 'react';
import './toolbar.css'
// ICONS
import AlignIcons from 'bpmn-js/lib/features/align-elements/AlignElementsIcons';
import DistributeIcons from 'bpmn-js/lib/features/distribute-elements/DistributeElementsIcons';
import Icons from '../../../resources/toolbar/toolbar-icons';

function Toolbar({   
    onSave, 
    onImport,
    onExport,
    onZoomIn, 
    onZoomOut, 
    onUndo, 
    onRedo, 
    onAlignLeft, 
    onAlignCenter, 
    onAlignRight, 
    onAlignTop, 
    onAlignMiddle, 
    onAlignBottom, 
    onDistributeHorizontally, 
    onDistributeVertically 
}) {

  const fonts = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana'];

  return (
    <div className="toolbar">

      <div className="toolbar-group-save">
        <button onClick={onSave} dangerouslySetInnerHTML={{ __html: Icons.save }} />
      </div>

      <div className='toolbar-spacing' dangerouslySetInnerHTML={{ __html: Icons.line }}/>

      <div className='toolbar-group-file'>
        <button onClick={onImport} dangerouslySetInnerHTML={{ __html: Icons.import }}/>
        
        <button className='export-button' onClick={onExport} dangerouslySetInnerHTML={{ __html: Icons.export }}/>
      </div>

      <div className='toolbar-spacing' dangerouslySetInnerHTML={{ __html: Icons.line }}/>

      <div className="toolbar-group-action">
        <button onClick={onUndo} dangerouslySetInnerHTML={{ __html: Icons.undo }}/>
        <button onClick={onRedo} dangerouslySetInnerHTML={{ __html: Icons.redo }}/>
      </div>

      <div className='toolbar-spacing' dangerouslySetInnerHTML={{ __html: Icons.line }}/>

      <div className="toolbar-group-zoom">
        <button onClick={onZoomOut} dangerouslySetInnerHTML={{ __html: Icons.zoomOut }}/>
        <button onClick={onZoomIn} dangerouslySetInnerHTML={{ __html: Icons.zoomIn }}/>
      </div>

      {/* <div className='toolbar-spacing' dangerouslySetInnerHTML={{ __html: Icons.line }}/>

      <div className='toolbar-font'>
        <select onChange={(event) => onFontChange(event.target.value)}>
            {fonts.map((font) => (
                <option value={font}>{font}</option>
            ))}
        </select>      
      </div> */}

      <div className='toolbar-spacing' dangerouslySetInnerHTML={{ __html: Icons.line }}/>

      <div className="toolbar-group-align">
        <button onClick={onAlignLeft} dangerouslySetInnerHTML={{ __html: AlignIcons.left }} />
        <button onClick={onAlignCenter} dangerouslySetInnerHTML={{ __html: AlignIcons.center }} />
        <button onClick={onAlignRight} dangerouslySetInnerHTML={{ __html: AlignIcons.right }} />
        <button onClick={onAlignTop} dangerouslySetInnerHTML={{ __html: AlignIcons.top }} />
        <button onClick={onAlignMiddle} dangerouslySetInnerHTML={{ __html: AlignIcons.middle }} />
        <button onClick={onAlignBottom} dangerouslySetInnerHTML={{ __html: AlignIcons.bottom }} />
        <button onClick={onDistributeHorizontally} dangerouslySetInnerHTML={{ __html: DistributeIcons.horizontal }} />
        <button onClick={onDistributeVertically} dangerouslySetInnerHTML={{ __html: DistributeIcons.vertical }} />
      </div>

      <div className='toolbar-spacing' dangerouslySetInnerHTML={{ __html: Icons.line }}/>

      <div className="toolbar-group-distribute">
        <button onClick={onDistributeHorizontally} dangerouslySetInnerHTML={{ __html: DistributeIcons.horizontal }} />
        <button onClick={onDistributeVertically} dangerouslySetInnerHTML={{ __html: DistributeIcons.vertical }} />
      </div>

    </div>

  );
}

export default Toolbar;
