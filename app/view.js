// import { h, render } from 'preact'

// import {
//   colorSetHSL,
//   colorSetRGB,
//   setTool,
//   paletteAdd,
//   paletteDelete,
//   layersAdd,
//   framesAdd,
//   layersSwap,
//   framesSwap,
//   layersDelete,
//   framesDelete,
//   lastFrame,
//   nextFrame,
//   layersEditHidden
// } from './app'

// const onGestureDown = (e, VIEW) => {
//   VIEW.window.request = e.target.dataset.request || ''
//   VIEW.window.mouseDown = true
//   VIEW.window.startX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
//   VIEW.window.startY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY
//   VIEW.window.prevX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
//   VIEW.window.prevY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY
//   VIEW.window.currX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
//   VIEW.window.prevY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY
// }

// const onGestureHover = (e, VIEW) => {
//   VIEW.window.prevX = VIEW.window.currX
//   VIEW.window.prevY = VIEW.window.prevY
//   VIEW.window.currX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
//   VIEW.window.prevY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY
// }

// const onGestureDrag = (e, VIEW) => {
//   VIEW.window.prevX = VIEW.window.currX
//   VIEW.window.prevY = VIEW.window.prevY
//   VIEW.window.currX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
//   VIEW.window.prevY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY

//   if (e.target.tagName !== 'INPUT') { // prevent block on input range elements
//     e.preventDefault() // block pull to refresh on mobile browsers
//   }
// }

// const onGestureEnd = (e, VIEW) => {
//   VIEW.window.request = ''
//   VIEW.window.mouseDown = false
//   VIEW.window.startX = 0
//   VIEW.window.startY = 0
//   VIEW.window.prevX = 0
//   VIEW.window.prevY = 0
//   VIEW.window.currX = 0
//   VIEW.window.currY = 0
// }

// const dragOrHover = (e, VIEW) => {
//   if (VIEW.window.mouseDown) {
//     onGestureDrag(e, VIEW)
//   } else {
//     onGestureHover(e, VIEW)
//   }
// }

// const View = ({ APP, VIEW }) => {
//   console.log(VIEW)
//   return (
//     <div
//       class='h-full'
//       onMouseDown={(e) => onGestureDown(e, VIEW) }
//       onMouseMove={(e) => { dragOrHover(e, VIEW) }}
//       onMouseUp={(e) => { onGestureEnd(e, VIEW) }}>
//       <div class='h-40 bg-light bord-dark-b fl'>
//         <div class="fl w-full">
//           <div class="fl-1 fl">
//             <div class="fl bord-dark-r rel w-40"
//               onMouseLeave={() => {
//                 VIEW.file.open = false
//                 updateView()
//               }}>
//               <button
//                 onClick={() => {
//                   VIEW.file.open = !VIEW.file.open
//                   updateView()
//                 }}
//                 class="fl fl-center m-0 p-0 w-40">
//                 <img src="img/bars.svg" />
//               </button>
//               <div
//                 class="bg-light fl-column bord-dark abs z-5"
//                 style={`visibility: ${VIEW.file.open ? 'visible' : 'hidden'}; top: 10px; left: 10px;`}>
//                 {
//                   ['new', 'download'].map(id => 
//                     <button class="m-0 p-h-15 h-40 fl fl-center-y">
//                       <img src={`img/${id}.svg`} />
//                       <small class="bold p-h-10" style='text-transform: capitalize;'>{id}</small>
//                     </button>
//                   )
//                 }
//               </div>
//             </div>
//             <div class='fl-1 fl fl-justify-center'>
//               <button class="fl fl-center m-0 p-0 w-40 bord-dark-l bord-dark-r">
//                 <img src="img/undo.svg" />
//               </button>
//               <button class="fl fl-center m-0 p-0 w-40 bord-dark-r">
//                 <img src="img/redo.svg" />
//               </button>
//             </div>
//           </div>
//           <div class="fl" style="max-width: 241px; min-width: 241px;">
            
//           </div>
//         </div>
//       </div>
//       <div class='fl' style='height: calc(100% - 40px);'>
//         <div class='w-40 bg-light bord-dark-r'>
//           {
//             ['pencil', 'eraser', 'line', 'circle', 'square', 'fill', 'eye-dropper', 'select'].map(tool => 
//               <button onClick={() => { setTool(tool) }} class="fl fl-center m-0 p-0 w-40 h-40 bord-dark-r" style={`${APP.tool === tool ? 'background: rgba(52, 152, 219, 255);' : ''}`}>
//                 <img src={`img/${tool}.svg`} />
//               </button>
//             )
//           }
//         </div>
//         <div class='w-full overflow' style='cursor: crosshair;'>
//           <div class='fl-1 h-full'>
//             <div class='fl-column h-full'>
//               <div class='txt-center fl-1'>
//                 <canvas
//                   id='canvas-view'
//                   width={APP.width}
//                   height={APP.height}
//                   style='width: 400px; height: 400px; background: white; margin: 10px;' />
//               </div>
//               <div class='bg-light bord-dark-t fl-column' style='height: 250px;'>
//                 <div class='fl w-full bord-dark-b h-30'>
//                   <div class='fl'>
//                     <div style='width: 100px;' class='bg-mid p-h-10 fl fl-center-y bord-dark-r'>
//                       <small><b>Layers</b></small>
//                     </div>
//                     <button
//                       onClick={() => { layersAdd() }}
//                       class='w-30 fl fl-center bord-dark-r' >
//                       <img src={`img/plus.svg`} />
//                     </button>
//                     <button
//                       onClick={() => { layersSwap('up') }}
//                       class='w-30 fl fl-center bord-dark-r'>
//                       <img src={`img/up.svg`} />
//                     </button>
//                     <button
//                       onClick={() => { layersSwap('down') }}
//                       class='w-30 fl fl-center bord-dark-r'>
//                       <img src={`img/down.svg`} />
//                     </button>
//                     <button
//                       onClick={() => { layersDelete() }}
//                       class='w-30 fl fl-center bord-dark-r'>
//                       <img src={`img/trash.svg`} />
//                     </button>
//                   </div>
//                   <div class='fl fl-1'>
//                     <div style='width: 100px;' class='bg-mid p-h-10 fl fl-center-y bord-dark-r'>
//                       <small><b>Frames</b></small>
//                     </div>
//                     <button
//                       onClick={() => { if (!VIEW.isPlaying) framesAdd() }}
//                       class='w-30 fl fl-center bord-dark-r'>
//                       <img src={`img/plus.svg`} />
//                     </button>
//                     <button
//                       onClick={() => { if (!VIEW.isPlaying) framesSwap('up') }}
//                       class='w-30 fl fl-center bord-dark-r'>
//                       <img src={`img/up.svg`} style='transform: rotate(-90deg);'/>
//                     </button>
//                     <button
//                       onClick={() => { if (!VIEW.isPlaying) framesSwap('down') }}
//                       class='w-30 fl fl-center bord-dark-r'>
//                       <img src={`img/down.svg`} style='transform: rotate(-90deg);' />
//                     </button>
//                     <button
//                       onClick={() => { if (!VIEW.isPlaying) framesDelete() }}
//                       class='w-30 fl fl-center bord-dark-r'>
//                       <img src={`img/trash.svg`} />
//                     </button>
//                     <div class='fl-1 fl fl-justify-end'>
//                       <div class='fl'>
//                         <button
//                           onClick={() => { lastFrame() }}
//                           class="fl fl-center m-0 p-0 w-30 bord-dark-l" >
//                           <img src="img/lastframe.svg" />
//                         </button>
//                         <button
//                           onClick={() => { togglePlay() }}
//                           class="fl fl-center m-0 p-0 w-30 bord-dark-l bord-dark-r" >
//                           <img src={`img/${VIEW.isPlaying ? 'stop.svg' : 'play.svg'}`} />
//                         </button>
//                         <button
//                           onClick={() => { nextFrame() }}
//                           class="fl fl-center m-0 p-0 w-30" >
//                           <img src="img/nextframe.svg" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div class='fl' style='height: calc(100% - 30px);'>
//                   <div class='bord-dark-r' style='width: 220px;'>
//                     {
//                       APP.layers.map((layer, li) => {
//                         return <div
//                           class='fl bord-light-b h-30'
//                           style={`background: ${APP.layerActive === li ? 'rgb(100, 100, 100)' :''};`}>
//                           <button
//                             style={`${layer.hidden ? 'background: rgba(52, 152, 219, 255);' : ''}`}
//                             onClick={() => { layersEditHidden(li) }}
//                             class='w-30 h-30 fl fl-center bord-light-b'>
//                             <img src={`img/${layer.hidden ? 'eye-active.svg' : 'eye.svg'}`} />
//                           </button>
//                           <button
//                             onClick={() => { setTargetCanvas(APP.frameActive, li) }}
//                             class='fl-1 txt-left'>
//                             <small style='font-size: 11px;'><b>{layer.name}</b></small>
//                           </button>
//                         </div>
//                       })
//                     }
//                   </div>
//                   <div class='fl-1 bg-mid'>
//                     <div class='w-full'>
//                       {
//                         APP.layers.map((layer, li) => {
//                           return <div
//                             class='fl w-full'>
//                             {
//                               layer.frames.map((canvas, fi) => {
//                                 return <button
//                                   onClick={() => { setTargetCanvas(fi, li) }}
//                                   class='w-30 h-30 fl fl-center bord-dark-r bord-dark-b bg-light'
//                                   style={`
//                                     background: ${
//                                       APP.frameActive === fi && APP.layerActive === li
//                                         ? 'rgba(52, 152, 219, 255)'
//                                         : (APP.frameActive === fi || APP.layerActive === li)
//                                           ? 'rgba(100, 100, 100, 255)'
//                                           : 'rgba(0, 0, 0, 0)'
//                                     };`}>
//                                   {/* <div class='bg-white' style='border-radius: 100%; width: 8px; height: 8px;' /> */}
//                                 </button>
//                               })
//                             }
//                           </div>
//                         })
//                       }
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div class='bg-light bord-dark-l' style="max-width: 241px; min-width: 241px;">
//           <div class='h-30 bg-mid bord-dark-b fl fl-center-y p-h-10'>
//             <small><b>Color</b></small>
//           </div>
//           <div
//             onInput={(e) => {
//               const hsl = [APP.color.hsl[0], APP.color.hsl[1], APP.color.hsl[2], APP.color.hsl[3]]
//               hsl[parseInt(e.target.dataset.index)] = parseInt(e.target.value)
              
//               colorSetHSL(hsl)
//             }}
//             class='bg-light bord-dark-b fl-column p-10'>
//             <div class='fl-column' style='padding-bottom: 5px;'>
//               <div class='fl fl-justify-between' style='padding-bottom: 5px;'>
//                 <small><b>Hue</b></small>
//                 <small>{APP.color.hsl[0]}</small>
//               </div>
//               <input
//                 value={APP.color.hsl[0]}
//                 data-index='0'
//                 type='range'
//                 class='b-r-2 w-full m-0'
//                 style='background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);'
//                 min='0'
//                 max='359'/>
//             </div>
//             <div class='fl-column' style='padding-bottom: 5px;'>
//               <div class='fl fl-justify-between' style='padding-bottom: 5px;'>
//                 <small><b>Saturation</b></small>
//                 <small>{APP.color.hsl[1]}</small>
//               </div>
//               <input
//                 value={APP.color.hsl[1]}
//                 data-index='1'
//                 type='range'
//                 class='b-r-2 w-full m-0'
//                 style={`background: linear-gradient(to right, hsl(${APP.color.hsl[0]}, 0%, 50%) 0%,hsl(${APP.color.hsl[0]}, 100%, 50%) 100%);`}/>
//             </div>
//             <div class='fl-column'>
//               <div class='fl fl-justify-between' style='padding-bottom: 5px;'>
//                 <small><b>Lightness</b></small>
//                 <small>{APP.color.hsl[2]}</small>
//               </div>
//               <input
//                 value={APP.color.hsl[2]}
//                 data-index='2'
//                 type='range'
//                 class='b-r-2 w-full m-0'
//                 style={`background: linear-gradient(to right, hsl(${APP.color.hsl[0]}, 100%, 0%) 0%, hsl(${APP.color.hsl[0]}, 100%, 50%) 50%, hsl(${APP.color.hsl[0]}, 100%, 100%) 100%)`}/>
//             </div>
//           </div>
//           <div class='h-30 bord-dark-b fl fl-justify-between'>
//             <div class='fl rel'>
//               {APP.palette.indexOf(APP.color.rgb) === -1 &&
//                 <button
//                   onClick={() => { paletteAdd() }}
//                   class='w-30 h-30 fl fl-center bord-dark-r bord-dark-b'>
//                   <img src={`img/plus.svg`} />
//                 </button>
//               }
//             </div>
//             <div class='fl-1 fl fl-center-y p-h-10'>
//               <div
//                   class='no-ptr fl-1 b-r-2'
//                   style={`min-height: 20px; background: rgba(${APP.color.rgb[0]}, ${APP.color.rgb[1]}, ${APP.color.rgb[2]}, 255);`} />
//             </div>
//             <div class='fl bord-dark-l'>
//               <button
//                 onClick={() => { paletteDelete() }}
//                 class='w-30 h-30 fl fl-center bord-dark-b'>
//                 <img src={`img/trash.svg`} />
//               </button>
//             </div>
//           </div>
//           <div class='fl fl-wrap overflow p-10' style='align-content: baseline;'>
//             {
//               APP.palette.map(color =>
//                 <button
//                   onClick={() => {
//                     colorSetRGB(color)
//                   }}
//                   class='m-0'
//                   style={`
//                     width: 44px;
//                     min-height: 25px;
//                     background: rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]});
//                     border: ${color === APP.color.rgb ? '2px solid rgba(61,61,61, 1)' : '2px solid rgba(61,61,61, 0)'};
//                     box-shadow: inset 0px 0px 0px 1px rgba(255, 255, 255, ${color === APP.color.rgb ? '255' : '0'});
//                   `} />
//               )
//             }
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // export const mountView = (APP, VIEW, mount) => {
// //   if (mount) {
// //     render(<View APP={APP} VIEW={VIEW} />, document.body)

// //     VIEW.render = () => {
// //       render(<View APP={APP} VIEW={VIEW} />, document.body, document.body.lastChild)
// //     }
// //   }
// // }
