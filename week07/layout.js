function getStyle(element) {
  if(!element.style){
      element.style = {}
  }
  for(let prop in element.computedStyle) {
      let p = element.computedStyle.value
      element.style[prop] = element.computedStyle[prop].value

      if(element.style[prop].toString().match(/px$/)) {
          element.style[prop] = parseInt(element.style[prop])
      }
      if(element.style[prop].toString().match(/^[0-9\.]+$/)) {
          element.style[prop] = parseInt(element.style[prop])
      }
  }
  return element.style
}

function layout(element) {
  if(!element.computedStyle) return

  let elementStyle = getStyle(element)

  if(elementStyle.display !== 'flex') return

  let items = element.children.filter(e => e.type === 'element')

  items.sort(function(a, b) {
      return (a.order || 0) - (b.order || 0)
  })

  let style = elementStyle;

  ['width', 'height'].forEach(size => {
      if(style[size] === 'auto' || style[size] === '') {
          style[size] = null
      }
  });

  if(!style.flexDirection || style.flexDirection === 'auto')
      style.flexDirection = 'row'
  if(!style.alignItems || style.alignItems === 'auto')
      style.alignItems = 'stretch'
  if(!style.justifyContent || style.justifyContent === 'auto')
      style.justifyContent = 'flex-start'
  if(!style.flexWrap || style.flexWrap === 'auto')
      style.flexWrap = 'nowrap'
  if(!style.alignContent || style.alignContent === 'auto')
      style.alignContent = 'stretch'
  // 确认方向
  let mainSize, mainStart, mainEnd, mainSign, mainBase,
      crossSize, crossStart, crossEnd, crossSign, crossBase
  if(style.flexDirection === 'row') {
      mainSize = 'width'
      mainStart = 'left'
      mainEnd = 'right'
      mainSign = +1
      mainBase = 0

      crossSize = 'height'
      crossStart = 'top'
      crossEnd = 'bottom'
  }
  if(style.flexDirection === 'row-reverse') {
      mainSize = 'width'
      mainStart = 'right'
      mainEnd = 'left'
      mainSign = -1
      mainBase = style.width

      crossSize = 'height'
      crossStart = 'top'
      crossEnd = 'bottom'
  }
  if(style.flexDirection === 'column') {
      mainSize = 'height'
      mainStart = 'top'
      mainEnd = 'bottom'
      mainSign = +1
      mainBase = 0

      crossSize = 'width'
      crossStart = 'left'
      crossEnd = 'right'
  }
  if(style.flexDirection === 'column-reverse') {
      mainSize = 'height'
      mainStart = 'bottom'
      mainEnd = 'top'
      mainSign = -1
      mainBase = style.height

      crossSize = 'width'
      crossStart = 'left'
      crossEnd = 'right'
  }

  if(style.flexWrap === 'wrap-reverse') {
      let tmp = crossStart
      crossStart = crossEnd
      crossEnd = tmp
      crossSign = -1
  } else {
      crossBase = 0
      crossSign = 1
  }
  // 分行，有个flext line的概念，每一行都是一个flex line
  // main space: 该行剩余空间 算剩余空间
  let isAutoMainSize = false
  if(!style[mainSize]) { // auto sizing
      elementStyle[mainSize] = 0
      for(let i=0; i<items.length; i++) {
          let item = items[i]
          let itemStyle = getStyle(item)
          if(itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)) {
              elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize]
          }
      }
      isAutoMainSize = true
      // style.flexWrap = 'nowrap'
  }

  let flexLine = []
  let flexLines = [flexLine]

  let mainSpace = elementStyle[mainSize]
  let crossSpace = 0

  for(let i=0; i<items.length; i++) {
      let item = items[i]
      let itemStyle = getStyle(item)

      if(itemStyle[mainSize] === null) {
          itemStyle[mainSize] = 0
      }

      if(itemStyle.flex) {
          // 这个分支是分行最重要的
          flexLine.push(item)
      } else if(style.flexWrap === 'nowrap' && isAutoMainSize) {
          mainSpace -= itemStyle[mainSize]
          if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
              crossSpace = Math.max(crossSpace, itemStyle[crossSize])
          }
          flexLine.push(item)
      } else {
          // 这个分支是分行最重要的
          if(itemStyle[mainSize] > style[mainSize]) {
              itemStyle[mainSize] = style[mainSize]
          }
          if(mainSpace < itemStyle[mainSize]) {
              flexLine.mainSpace = mainSpace
              flexLine.crossSpace = crossSpace

              flexLine = []
              flexLines.push(flexLine)

              flexLine.push(item)

              mainSpace = style[mainSize]
              crossSpace = 0
          } else {
              flexLine.push(item)
          }
          if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
              crossSpace = Math.max(crossSpace, itemStyle[crossSize])
          }
          mainSpace -= itemStyle[mainSize]
      }
  }
  flexLine.mainSpace = mainSpace

  if(style.flexWrap === 'nowrap' || isAutoMainSize) {
      flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize] : crossSpace
  } else {
      flexLine.crossSpace = crossSpace
  }

  // 计算主轴
  if(mainSpace < 0) {
      // overflow (happens only if container is single line), scale every item
      let scale = style[mainSize]/(style[mainSize]- mainSpace)
      let currentMain = mainBase
      for(let i=0; i<items.length; i++) {
          let item = items[i]
          let itemStyle = getStyle(item)

          if(itemStyle.flex) {
              itemStyle[mainSize] = 0
          }
          
          itemStyle[mainSize] = itemStyle[mainSize] * scale

          itemStyle[mainStart] = currentMain
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
          currentMain = itemStyle[mainEnd]
      }
  } else {
      // process each flex line
      flexLines.forEach(function(items) {
          let mainSpace = items.mainSpace
          let flexTotal = 0
          for (let i=0; i<items.length; i++) {
              let item = items[i]
              let itemStyle = getStyle(item)

              if((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))) {
                  flexTotal += itemStyle.flex
                  continue
              }
          }

          if(flexTotal > 0) {
              // there is flexible flex items
              let currentMain = mainBase
              for (let i=0; i<items.length; i++) {
                  let item = items[i]
                  let itemStyle = getStyle(item)

                  if(itemStyle.flex) {
                      itemStyle[mainSize] = (mainSpace/flexTotal) * itemStyle.flex
                  }
                  itemStyle[mainStart] = currentMain
                  itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                  currentMain = itemStyle[mainEnd]
              }
          } else {
              // there is *No* flexible flex items, which means, justifyContent should work
              if(style.justifyContent === 'flex-start') {
                  let currentMain = mainBase
                  let step = 0
              }
              if(style.justifyContent === 'flex-end') {
                  let currentMain = mainSpace * mainSign + mainBase
                  let step = 0
              }
              if(style.justifyContent === 'center') {
                  let currentMain = mainSpace / 2 * mainSign + mainBase
                  let step = 0
              }
              if(style.justifyContent === 'space-between') {
                  let step = mainSpace / (items.length - 1) * mainSign
                  let currentMain = mainBase
              }
              if(style.justifyContent === 'space-around') {
                  let step = mainSpace / items.length * mainSign
                  let currentMain = step / 2 + mainBase
              }
              for(let i=0; i<items.length; i++) {
                  let item = items[i]
                  itemStyle[mainStart] = currentMain
                  itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                  currentMain = itemStyle[mainEnd] + step
              }
          }
      })
  }
  // compute the cross axis sizes
  // align-items, align-self
  // let crossSpace
  if(!style[crossSize]) { // zuto sizing
      crossSpace = 0
      elementStyle[crossSize] = 0
      for(let i=0; i<flexLines.length; i++) {
          elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace
      }
  } else {
      crossSpace = style[crossSize]
      for(let i=0; i<flexLines.length; i++) {
          crossSpace -= flexLines[i].crossSpace
      }
  }

  if(style.flexWrap === 'wrap-reverse') {
      crossBase = style[crossSize]
  } else {
      crossBase = 0
  }
  let lineSize = style[crossSize] / flexLines.length

  let step
  if(style.alignContent === 'flex-start') {
      crossBase += 0
      step = 0
  }
  if(style.alignContent === 'flex-end') {
      crossBase += crossSign * crossSpace
      step = 0
  }
  if(style.alignContent === 'center') {
      crossBase += crossSign * crossSpace / 2
      step = 0
  }
  if(style.alignContent === 'space-between') {
      crossBase += 0
      step = crossSpace / (flexLines.length - 1)
  }
  if(style.alignContent === 'space-around') {
      crossBase += crossSign * step / 2
      step = crossSpace / (flexLines.length)
  }
  if(style.alignContent === 'stretch') {
      crossBase += 0
      step = 0
  }
  flexLines.forEach(function(items) {
      let lineCrossSize = style.alignContent === 'stretch' ?
          items.crossSpace + crossSpace / flexLines.length :
          items.crossSpace
      for(let i=0; i<items.length; i++) {
          let item = items[i]
          let itemStyle = getStyle(item)

          let align = itemStyle.alignSelf || style.alignItems

          if(itemStyle[crossSize] === null) {
              itemStyle[crossSize] = (align === 'stretch') ?
                  lineCrossSize : 0
          }

          if(align === 'flex-start') {
              itemStyle[crossStart] = crossBase
              itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
          }
          if(align === 'flex-end') {
              itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize]
              itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize
          }
          if(align === 'center') {
              itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2
              itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
          }
          if(align === 'stretch') {
              itemStyle[crossStart] = crossBase
              itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) ?
                  itemStyle[crossSize] : lineCrossSize)
              
                  itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
          }
      }
      crossBase += crossSign * (lineCrossSize + step)
  })
  // console.log(items)
}
// yb added
// let element = {
//     type: 'element',
//     tagName: 'style',
//     attributes: [],
//     computedStyle: {},
//     children: [{
//         type: 'text',
//         content: '\nbody div #myid{\n    width: 100px;\n    background-color: #ff5000;\n}\nbody div img {\n    width: 30px;\n    background-color: #ff1111;\n}\n    '
//     }],
//     parent: {
//         type: 'element',
//         tagName: 'head',
//         attributes: [],
//         computedStyle: {},
//         children: [],
//         parent: {
//             type: 'element',
//             tagName: 'html',
//             attributes: [],
//             computedStyle: {},
//             children: [],
//             parent: {}
//         }
//     }
// }
// layout(element)
module.exports = layout