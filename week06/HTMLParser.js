const {computeCSS,addCSSRules}=require('./CSSParser')
let currentToken = null
let currentAttribute = null

let stack = [{ type: 'document', children: [] }]
let currentTextNode = null

const EOF = Symbol('EOF')

function data(char) {
  if (char === '<') {
    return tagOpen
  } else if (char === EOF) {
    emit({
      type: "EOF"
    })
  } else {
    emit({
      type: 'text',
      content: char
    })
    return data
  }
}

function emit(token) {
  let top = stack[stack.length - 1]
  if (token.type === 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attributes: []
    }

    element.tagName = token.tagName

    for (let p in token) {
      if (p !== 'type' || p !== 'tagName') {
        element.attributes.push({
          name: p,
          value: token[p]
        })
      }
    }
    computeCSS(element,stack)
    top.children.push(element)

    if (!token.isSelfClosing) {
      stack.push(element)
    }

    currentTextNode = null
  } else if (token.type === 'endTag') {
    if (top.tagName !== token.tagName) {
      throw new Error("Tag start end doesn't match!")
    } else {
      if(top.tagName==='style'){
        addCSSRules(top.children[0].content)
      }
      stack.pop()
    }
    currentTextNode = null
  } else if (token.type === 'text') {
    if (currentTextNode === null) {
      currentTextNode = {
        type: "text",
        content: ''
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  }
}

function tagOpen(char) {
  if (char === '/') {
    return endTagOpen
  } else if (char.match(/^[a-zA-Z]/)) {
    currentToken = {
      type: 'startTag',
      tagName: ""
    }
    return tagName(char)
  } else {
    emit({
      type: 'text',
      content: char
    })
    return
  }
}
function tagName(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (char === '/') {
    return selfClosingStartTag
  } else if (char.match(/^[A-Z]$/)) {
    currentToken.tagName += char
    return tagName
  } else if (char === '>') {
    emit(currentToken)
    return data
  } else {
    currentToken.tagName += char
    return tagName
  }
}
function beforeAttributeName(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (char === '/' || char === '>' || char === EOF) {
    return afterAttributeName(char)
  } else if (char === '=') {

  } else {
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(char)
  }
}
function attributeName(char) {
  if (char.match(/^[\t\n\f ]$/) || char === '/' || char === '>' || char === EOF) {
    return afterAttributeName(char)
  } else if (char === '=') {
    return beforeAttributeValue
  } else if (char === '\u0000') {

  } else if (char === '\"' || char === "'" || char === '<') {

  } else {
    currentAttribute.name += char
    return attributeName
  }
}
function beforeAttributeValue(char) {
  if (char.match(/^[\t\n\f ]$/) || char === '/' || char === '>' || char === EOF) {
    return beforeAttributeValue
  } else if (char === '\"') {
    return doubleQuotedAttributeValue
  } else if (char === "\'") {
    return singleQuotedAttributeValue
  } else if (char === '>') {

  } else {
    return unquotedAttributeValue(char)
  }
}
function doubleQuotedAttributeValue(char) {
  if (char === '\"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue
  } else if (char === '\u0000') {

  } else if (char === EOF) {

  } else {
    currentAttribute.value += char
    return doubleQuotedAttributeValue
  }
}
function singleQuotedAttributeValue(char) {
  if (char === "\'") {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (char === '\u0000') {

  } else if (char === EOF) {

  } else {
    currentAttribute.value += char
    return singleQuotedAttributeValue
  }
}
function afterQuotedAttributeValue(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (char === '/') {
    return selfClosingStartTag
  } else if (char === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (char === EOF) {

  } else {
    currentAttribute.value += char
    return doubleQuotedAttributeValue
  }
}
function unquotedAttributeValue(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  } else if (char === '/') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return selfClosingStartTag
  } else if (char === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (char === '\u0000') {

  } else if (char === '\"' || char === "'" || char === '<' || char === '=' || char == '`') {

  } else if (char === EOF) {

  } else {
    currentAttribute.value += char
    return unquotedAttributeValue
  }
}
function selfClosingStartTag(char) {
  if (char === ">") {
    currentToken.isSelfClosing = true
    emit(currentToken)
    return data
  } else if (char === "EOF") {

  } else {

  }
}
function endTagOpen(char) {
  if (char.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "endTag",
      tagName: ""
    }
    return tagName(char)
  } else if (char === '>') {

  } else if (char === EOF) {

  } else {

  }
}
function afterAttributeName(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return afterAttributeName
  } else if (char === '/') {
    return selfClosingStartTag
  } else if (char === '=') {
    return beforeAttributeName
  } else if (char === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (char === EOF) {

  } else {
    currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(char)
  }
}

module.exports = function parseHTML(html) {
  let state = data
  for (let char of html) {
    state = state(char)
  }
  state = state(EOF)
  return stack[0]
}