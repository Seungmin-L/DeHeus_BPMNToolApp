import React from 'react';
import './toolbar.css'
// ICONS
import AlignIcons from 'bpmn-js/lib/features/align-elements/AlignElementsIcons';
import DistributeIcons from 'bpmn-js/lib/features/distribute-elements/DistributeElementsIcons';
import Icons from '../../../resources/toolbar/toolbar-icons';

function Toolbar({   
    onSave, 
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
  return (
    <div className="toolbar">

      <div className="toolbar-group-file">
        <button onClick={onSave} dangerouslySetInnerHTML={{ __html: Icons.save }} />
      </div>

      <div className='toolbar-spacing' dangerouslySetInnerHTML={{ __html: Icons.line }}/>

      <div className="toolbar-group-zoom">
        <button onClick={onZoomIn} dangerouslySetInnerHTML={{ __html: Icons.zoomIn }}/>
        <button onClick={onZoomOut} dangerouslySetInnerHTML={{ __html: Icons.zoomOut }}/>
      </div>

      <div className='toolbar-spacing' dangerouslySetInnerHTML={{ __html: Icons.line }}/>

      <div className="toolbar-group-action">
        <button onClick={onUndo} dangerouslySetInnerHTML={{ __html: Icons.undo }}/>
        <button onClick={onRedo} dangerouslySetInnerHTML={{ __html: Icons.redo }}/>
      </div>

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
