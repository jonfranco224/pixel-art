import { h, render, Component } from 'preact'
import { APP, VIEW, ENV, initCanvases, newData } from './state'
import { setupKeyListeners } from './keyboard'

// Components
import { Color } from './components/color'
import { Timeline } from './components/timeline'
import { Canvas, paintCanvas } from './components/canvas'
import { Header } from './components/header'
import { Toolbar } from './components/toolbar'

const downloadCanvas = (e) => {
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')
  const height = APP.height * VIEW.downloadCanvas.size
  const width = APP.width * VIEW.downloadCanvas.size

  if (VIEW.downloadCanvas.type === 'frame') {
    c.width = width
    c.height = height

    ctx.webkitImageSmoothingEnabled = false
    ctx.mozImageSmoothingEnabled = false
    ctx.imageSmoothingEnabled = false

    APP.layers.forEach(layer => {
      VIEW.canvasTemp.ctx.putImageData(layer.frames[APP.frameActive], 0, 0)
      ctx.drawImage(VIEW.canvasView.dom, 0, 0, c.width, c.height)
    })

    const image = c.toDataURL('image/png').replace('image/png', 'image/octet-stream')
    e.target.setAttribute('href', image)
  }

  if (VIEW.downloadCanvas.type === 'spritesheet') {
    const totalWidth = APP.width * VIEW.downloadCanvas.size * APP.frameCount
    c.width = totalWidth
    c.height = height

    ctx.webkitImageSmoothingEnabled = false
    ctx.mozImageSmoothingEnabled = false
    ctx.imageSmoothingEnabled = false

    for (let frameI = 0; frameI < APP.frameCount; frameI++) {
      APP.layers.forEach(layer => {
        VIEW.canvasTemp.ctx.putImageData(layer.frames[frameI], 0, 0)
        ctx.drawImage(VIEW.canvasTemp.dom, frameI * width, 0, width, height)
      })
    }

    const image = c.toDataURL('image/png').replace('image/png', 'image/octet-stream')
    e.target.setAttribute('href', image)
  }

  if (VIEW.downloadCanvas.type === 'numgrid') {
    c.width = APP.width
    c.height = APP.height

    ctx.webkitImageSmoothingEnabled = false
    ctx.mozImageSmoothingEnabled = false
    ctx.imageSmoothingEnabled = false

    APP.layers.forEach(layer => {
      VIEW.canvasTemp.ctx.putImageData(layer.frames[APP.frameActive], 0, 0)
      ctx.drawImage(VIEW.canvasView.dom, 0, 0, c.width, c.height)
    })

    const finalImage = ctx.getImageData(0, 0, c.width, c.height)

    const areRGBAsEqual = (c1, a, c2, b) => {
      return (
        c1[a + 0] === c2[b + 0] &&
        c1[a + 1] === c2[b + 1] &&
        c1[a + 2] === c2[b + 2] &&
        c1[a + 3] === c2[b + 3]
      )
    }

    const newCanvas = document.createElement('canvas')
    newCanvas.width = APP.width * 40
    newCanvas.height = (APP.height * 40) + 40
    const newCanvasCtx = newCanvas.getContext('2d')

    let index = 0

    let includedColors = []

    for (let i = 0; i < finalImage.data.length; i += 4) {
      let x = index % APP.width
      let y = Math.floor(index / APP.height)

      APP.palette.forEach((color, paletteIndex) => {
        if (areRGBAsEqual(color, 0, [finalImage.data[i + 0], finalImage.data[i + 1], finalImage.data[i + 2], finalImage.data[i + 3]], 0)) {
          newCanvasCtx.fillStyle = 'rgba(5, 5, 5, .3)'
          newCanvasCtx.font = '20px serif'
          newCanvasCtx.fillText(paletteIndex, (x * 40) + 15, ((y + 2) * 40) - 15)
          newCanvasCtx.strokeStyle = 'rgba(5, 5, 5, .2)'
          newCanvasCtx.strokeRect(x * 40, (y + 1) * 40, 40, 40)

          console.log(paletteIndex)

          let includeColor = true
      
          includedColors.forEach(colorPrep => {
            if (areRGBAsEqual(colorPrep.color, 0, [finalImage.data[i + 0], finalImage.data[i + 1], finalImage.data[i + 2], finalImage.data[i + 3]], 0)) {
              includeColor = false
            }
          })

          if (includeColor) {
            includedColors.push({
              paletteIndex: paletteIndex,
              color: [finalImage.data[i + 0], finalImage.data[i + 1], finalImage.data[i + 2], finalImage.data[i + 3]]
            })
          }
        }
      })

      includedColors.forEach((includedColor, includedColorI)=> {
        newCanvasCtx.fillStyle = `rgba(${includedColor.color[0]}, ${includedColor.color[1]}, ${includedColor.color[2]}, 255)`
        newCanvasCtx.font = '20px serif';
        newCanvasCtx.fillText(includedColor.paletteIndex, (includedColorI * 80) + 15, 40);
        newCanvasCtx.fillRect((includedColorI * 80) + 40, 0, 40, 40)
      })

      index += 1
    }

    const image = newCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
    e.target.setAttribute('href', image)
  }
}

class View extends Component{
  componentDidMount () {
    VIEW.render = () => {
      this.setState({}, () => {
        VIEW.canvasTemp.ctx.clearRect(0, 0, APP.width, APP.height)
        VIEW.canvasFinal.ctx.clearRect(0, 0, APP.width, APP.height)
        VIEW.canvasView.ctx.clearRect(0, 0, APP.width, APP.height)

        APP.layers.forEach((layer, i) => {
          VIEW.canvasView.ctx.globalAlpha = 1

          if (layer.hidden) return

          // Onion skinning
          if (APP.layerActive === i && VIEW.onionSkinning && !VIEW.isPlaying) {
            const framesAhead = 3
            const framesBehind = 3
            const framesTotal = framesBehind + framesAhead

            VIEW.canvasView.ctx.globalAlpha = .5

            for (let a = framesAhead - framesTotal; a < framesAhead; a++) {
              if (!layer.frames[APP.frameActive - a]) continue

              const target = layer.frames[APP.frameActive - a] 
              VIEW.canvasTemp.ctx.putImageData(target, 0, 0)
              VIEW.canvasView.ctx.drawImage(VIEW.canvasTemp.dom, 0, 0)
            }
          }

          // Regular frame render
          VIEW.canvasView.ctx.globalAlpha = 1

          const target = layer.frames[APP.frameActive]

          for (let b = 0; b < 2; b++) { // For whatever reason safari makes me do this twice
            // Target Canvas
            VIEW.canvasTemp.ctx.putImageData(target, 0, 0)
            VIEW.canvasView.ctx.drawImage(VIEW.canvasTemp.dom, 0, 0)
            
            // Preview Canvas
            if (APP.layerActive === i) {
              VIEW.canvasTemp.ctx.putImageData(VIEW.canvasPreview.imgData, 0, 0)
              VIEW.canvasView.ctx.drawImage(VIEW.canvasTemp.dom, 0, 0)
            }
          }
        })
        
        const tile = 30

        VIEW.canvasTimeline.width = APP.frameCount * tile * 2
        VIEW.canvasTimeline.height = APP.layerCount * tile * 2
        VIEW.canvasTimeline.style.width = `${APP.frameCount * tile}px`
        VIEW.canvasTimeline.style.height = `${APP.layerCount * tile}px`
        const ctx = VIEW.canvasTimeline.getContext('2d')

        VIEW.canvasTimelineTemp.width = APP.frameCount * tile * 2
        VIEW.canvasTimelineTemp.height = APP.layerCount * tile * 2
        const ctxTemp = VIEW.canvasTimelineTemp.getContext('2d')

        APP.layers.map((layer, li) => {
          layer.frames.map((canvas, fi) => {
            const w = tile * 2
            const h = tile * 2
            const x = fi * w
            const y = li * h
            const BG = APP.frameActive === fi && APP.layerActive === li
                        ? 'rgba(52, 152, 219, 255)'
                        : (APP.frameActive === fi || APP.layerActive === li)
                          ? 'rgba(100, 100, 100, 255)'
                          : 'rgba(50, 50, 50, 255)'


            ctx.fillStyle = 'rgba(33, 33, 33, 255)'
            ctx.fillRect(x, ((APP.layerCount - 1) * h) - y, w, h)
            
            ctx.fillStyle = BG
            ctx.fillRect(x, ((APP.layerCount - 1) * h) - y, w - 2, h - 2)
            
            ctxTemp.putImageData(canvas, x + 5, (((APP.layerCount - 1) * h) - y) + 5, 0, 0, w - 13, h - 13)    
          })
        })

        ctx.drawImage(VIEW.canvasTimelineTemp, 0, 0)
      })
    }

    initCanvases()

    this.funcs = { paintCanvas }

    // View control customization
    this.canvasOuterScroll = document.querySelector('#canvas-outer-scroll')
    this.canvasInnerScroll = document.querySelector('#canvas-inner-scroll')

    this.timelineScroll = {
      isSyncingLeftScroll: false,
      isSyncingRightScroll: false,
      leftDiv: document.querySelector('#layers'),
      rightDiv: document.querySelector('#frames')
    }

    this.timelineScrollController()
    this.centerCanvas()

    // Adding google analytics
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'UA-144729452-1');
  }

  centerCanvas () {
    const outerW = this.canvasOuterScroll.offsetWidth
    const innerW = this.canvasInnerScroll.offsetWidth
    const outerH = this.canvasOuterScroll.offsetHeight
    const innerH = this.canvasInnerScroll.offsetHeight
    
    this.canvasOuterScroll.scrollLeft = Math.floor((innerW - outerW) / 2) + 8
    this.canvasOuterScroll.scrollTop = Math.floor((innerH - outerH) / 2) + 8
  }

  timelineScrollController () {
    this.timelineScroll.leftDiv.addEventListener('scroll', (e) => {
      if (!this.timelineScroll.isSyncingLeftScroll) {
        this.timelineScroll.isSyncingRightScroll = true
        this.timelineScroll.rightDiv.scrollTop = e.target.scrollTop
      }
      this.timelineScroll.isSyncingLeftScroll = false
    })
    
    this.timelineScroll.rightDiv.addEventListener('scroll', (e) => {
      if (!this.timelineScroll.isSyncingRightScroll) {
        this.timelineScroll.isSyncingLeftScroll = true
        this.timelineScroll.leftDiv.scrollTop = e.target.scrollTop
      }
      this.timelineScroll.isSyncingRightScroll = false
    })
  }

  onGestureDown (e) {
    if (!VIEW.isPlaying) 

    VIEW.window.request = e.target.dataset.request || ''
    VIEW.window.mouseDown = true
    VIEW.window.startX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
    VIEW.window.startY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY
    VIEW.window.prevX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
    VIEW.window.prevY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY
    VIEW.window.currX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
    VIEW.window.currY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY

    if (VIEW.window.request) this.funcs[VIEW.window.request]('start')
  }
  
  onGestureDrag (e) {
    if (!VIEW.isPlaying) 

    VIEW.window.prevX = VIEW.window.currX
    VIEW.window.prevY = VIEW.window.currY
    VIEW.window.currX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
    VIEW.window.currY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY
    
    if (VIEW.window.request) this.funcs[VIEW.window.request]('resume')
  
    if (e.target.tagName !== 'INPUT') { // prevent block on input range elements
      e.preventDefault() // block pull to refresh on mobile browsers
    }
  }

  onGestureEnd (e) {
    if (!VIEW.isPlaying)

    if (VIEW.window.request) this.funcs[VIEW.window.request]('end')

    VIEW.window.request = ''
    VIEW.window.mouseDown = false
    VIEW.window.startX = 0
    VIEW.window.startY = 0
    VIEW.window.prevX = 0
    VIEW.window.prevY = 0
    VIEW.window.currX = 0
    VIEW.window.currY = 0
  }

  onGestureHover (e) {
    if (!VIEW.isPlaying)

    VIEW.window.prevX = VIEW.window.currX
    VIEW.window.prevY = VIEW.window.currY
    VIEW.window.currX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
    VIEW.window.currY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY

    if (e.target.dataset.hover) this.funcs[e.target.dataset.hover]('hover')
  }
  
  dragOrHover (e) {
    if (VIEW.window.mouseDown) {
      this.onGestureDrag(e)
    } else {
      this.onGestureHover(e)
    }
  }

  render () {
    return (
      <div
        class='h-full relative'
        onMouseDown={(e) => { if (e.which === 1) this.onGestureDown(e); }}
        onMouseMove={(e) => { this.dragOrHover(e) }}
        onMouseUp={(e) => { this.onGestureEnd(e) }}
        onMouseLeave={(e) => { this.onGestureEnd(e) }}>
        {/* {ENV === 'DEV' && <div id='debugger' class='abs' style='right: 0px; left: 0px; width: 100px; height: 100px; background: white; z-index: 1000;'>
          <canvas />
        </div>} */}
        <Header />
        <div class='fl' style='height: calc(100% - 40px); '>
          <Toolbar />
          <div class='fl-column' style='width: calc(100% - 281px);'>
            <Canvas />
            <Timeline />
          </div>
          <div class='bg-light bord-dark-l fl-column' style="max-width: 241px; min-width: 241px;">
            <div class='bord-dark-b fl-column overflow'>
              <div class='h-30 bg-mid bord-dark-b fl fl-center-y p-h-10'>
                <small><b>Tool</b></small>
              </div>
              <div class='fl-1 overflow'>
                <div class="fl fl-center p-10">
                  <small style="width: 150px; font-size: 11px;">Brush Size</small>
                  <div class='fl-1 select'>
                    <select
                      onInput={(e) => {
                        VIEW.brushSize = parseInt(e.target.value)
                      }}
                      value={VIEW.brushSize}
                      class="w-full">
                        {
                          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size, i) => {
                            return <option value={i}>{size}</option>
                          })
                        }
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <Color />
            <div class='bord-dark-b fl-column overflow' style='min-height: 249px; max-height: 249px;'>
              <div class='h-30 bg-mid bord-dark-b fl fl-center-y p-h-10'>
                <small><b>History</b></small>
              </div>
              <div class='fl-1 overflow'>
                {
                  VIEW.undo.map((entry, i) => {
                    return <button class={`p-h-10 h-30 w-full txt-left fl fl-center-y no-ptr ${VIEW.undoPos === i ? 'bg-xlight' : ''}`} >
                      <img width='10' height='10' style='margin-right: 10px;' src={`img/${entry.icon}`} />
                      <small style='text-transform: capitalize; font-size: 11px;'><b>{entry.action}</b></small>
                    </button>
                  })
                }
              </div>
            </div>
          </div>
        </div>
        {VIEW.newCanvas.open && <div class="abs top left w-full h-full fl fl-justify-center" style="z-index: 10;">
          <div class="w-full overflow-hidden" style="max-width: 300px; margin-top: 175px;">
            <div class="fl fl-center bg-mid bord-dark p-v-5" style='border-top-right-radius: 5px; border-top-left-radius: 5px;'><small><b>New Canvas</b></small></div>
            <div class="p-10 bg-light bord-dark-l bord-dark-r bord-dark-b" style='border-bottom-right-radius: 5px; border-bottom-left-radius: 5px;'>
              <div class="m-5 p-v-5">
                <div class="fl fl-center">
                  <small class="bold" style="width: 100px;">Dimensions</small>
                  <div class='fl-1 select'>
                    <select
                      onInput={(e) => {
                        const val = e.target.value.split('x')
                        VIEW.newCanvas.w = parseInt(val[0])
                        VIEW.newCanvas.h = parseInt(val[1])
                      }}
                      class="w-full">
                      <option value="32x32">32x32</option>
                      <option value="50x50">50x50</option>
                      <option value="64x64">64x64</option>
                      <option value="100x100">100x100</option>
                      <option value="128x128">128x128</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="fl" style="padding-top: 5px;">
                <button
                  onClick={() => {
                    VIEW.newCanvas.open = false
                    VIEW.render()
                  }}
                  class="b-r-2 bold p-5 w-full bg-red m-5">Cancel</button>
                <button
                  onClick={() => {
                    newData(VIEW.newCanvas.w, VIEW.newCanvas.h)
                    VIEW.newCanvas.open = false
                    VIEW.render()
                  }}
                  class="b-r-2 bold p-5 w-full bg-green m-5">Confirm</button>
              </div>
            </div>
          </div>
        </div>}
        {VIEW.downloadCanvas.open && <div class="abs top left w-full h-full fl fl-center-x" style="z-index: 10;">
          <div class="w-full" style="max-width: 300px; overflow: hidden; margin-top: 175px;">
              <div class="fl fl-center bg-mid bord-dark p-v-5" style='border-top-right-radius: 5px; border-top-left-radius: 5px;'><small class="bold">Download</small></div>
              <div class="p-10 bg-light bord-dark-l bord-dark-r bord-dark-b" style='border-bottom-right-radius: 5px; border-bottom-left-radius: 5px;'>
                <div class="m-5 p-v-5">
                  <div class="fl fl-center">
                    <small class="bold" style="width: 100px;">Type</small>
                    <div class='fl-1 select'>
                      <select
                        onInput={(e) => {
                          VIEW.downloadCanvas.type = e.target.value
                        }}
                        value={VIEW.downloadCanvas.type}
                        id="config-download-size" class="w-full">
                          <option value="frame">Frame</option>
                          <option value="spritesheet">Spritesheet</option>
                          <option value="numgrid">Number Grid</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="m-5 p-v-5">
                    <div class="fl fl-center">
                      <small class="bold" style="width: 100px;">Size</small>
                      <div class='fl-1 select'>
                        <select
                          onInput={(e) => {
                            VIEW.downloadCanvas.size = parseInt(e.target.value)
                          }}
                          value={VIEW.downloadCanvas.size}
                          id="config-download-size" class="w-full">
                            <option value="2">2x</option>
                            <option value="4">4x</option>
                            <option value="8">8x</option>
                            <option value="16">16x</option>
                            <option value="32">32x</option>
                            <option value="64">64x</option>
                        </select>
                      </div>
                    </div>
                </div>
                <div class="fl" style="padding-top: 5px;">
                  <button
                    onClick={() => {
                      VIEW.downloadCanvas.open = false
                      VIEW.render()
                    }}
                    class="b-r-2 bold p-5 w-full bg-red m-5">Cancel</button>
                  <a
                    onClick={(e) => {
                      downloadCanvas(e)
                    }}
                    class="w-full m-5 clickable" download="pixel-art.png" style="display: inline-block;">
                    <button class="b-r-2 bold p-5 w-full bg-green no-ptr">Download</button>
                  </a>
                </div>
              </div>
          </div>
        </div>}
      </div>
    )
  }
}

const loadData = ({ onLoaded, onError }) => {
  //console.time('startRead')
  localforage.getItem('pixel-art-app').then((stored) => {
    //console.timeEnd('startRead')
    for (const key in stored) {
      APP[key] = stored[key]
    }

    onLoaded()
  }).catch(function(err) {
    console.log(err)
    onError()
  });
}

const saveData = () => {
  setTimeout(() => {
    console.time('startwrite')
    localforage.setItem('pixel-art-app', APP).then(function(value) {
      console.timeEnd('startwrite')
    }).catch(function(err) {
      console.log(err);
    });
  }, 50)
}

const onProgramStart = () => {
  console.log('Program started.')

  newData(64, 64, true)
  render(<View />, document.body)
  
  loadData({
    onLoaded: () => {
      initCanvases()
      VIEW.render()
    },
    onError: () => {}
  })

  setupKeyListeners()
  
  window.addEventListener('keyup', saveData)
  window.addEventListener('mouseup', saveData)
}

window.addEventListener('load', onProgramStart)
if (ENV === 'PROD') {
  window.addEventListener('beforeunload', (event) => {
    event.returnValue = `Are you sure you want to leave?`;
  });
}

