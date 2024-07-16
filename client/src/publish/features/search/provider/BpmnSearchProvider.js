import {
    map,
    filter,
    sortBy
  } from 'min-dash';
  
  import {
    getLabel
  } from 'bpmn-js/lib/util/LabelUtil';
  
  /**
   * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
   * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
   * @typedef {import('diagram-js/lib/features/search-pad/SearchPad').default} SearchPad
   *
   * @typedef {import('diagram-js/lib/features/search-pad/SearchPadProvider').default} SearchPadProvider
   * @typedef {import('diagram-js/lib/features/search-pad/SearchPadProvider').SearchResult} SearchResult
   */
  
  /**
   * Provides ability to search for BPMN elements.
   *
   * @implements {SearchPadProvider}
   *
   * @param {ElementRegistry} elementRegistry
   * @param {SearchPad} searchPad
   * @param {Canvas} canvas
   */
  export default function BpmnSearchProvider(elementRegistry, searchPad, canvas) {
    this._elementRegistry = elementRegistry;
    this._canvas = canvas;
  
    searchPad.registerProvider(this);
  }
  
  BpmnSearchProvider.$inject = [
    'elementRegistry',
    'searchPad',
    'canvas'
  ];
  
  /**
   * @param {string} pattern
   *
   * @return {SearchResult[]}
   */
  BpmnSearchProvider.prototype.find = function(pattern) {
    var rootElements = this._canvas.getRootElements();
  
    var elements = this._elementRegistry.filter(function(element) {
      if (element.labelTarget) {
        return false;
      }
      return true;
    });
  
    // do not include root element
    elements = filter(elements, function(element) {
      return !rootElements.includes(element);
    });
  
    elements = map(elements, function(element) {
      let tertiaryTokens = [];
      if (element.businessObject && 
          element.businessObject.extensionElements) {
          var parameters = element.businessObject.extensionElements.values[0].values;
          for(let i = 0; i < parameters.length; i++){
            let tokens = matchAndSplit(parameters[i].name || '', pattern);
            tertiaryTokens = tertiaryTokens.concat(tokens);
          }
      }
  
      return {
          primaryTokens: matchAndSplit(getLabel(element), pattern),
          secondaryTokens: matchAndSplit(element.id, pattern),
          tertiaryTokens: tertiaryTokens,
          fourthTokens: matchAndSplit(element.businessObject.documentation || '', pattern),
          element: element
      };
  });
  
  
    // exclude non-matched elements
    elements = filter(elements, function(element) {
      return hasMatched(element.primaryTokens) || hasMatched(element.secondaryTokens) || hasMatched(element.tertiaryTokens) || hasMatched(element.fourthTokens);
    });
  
    elements = sortBy(elements, function(element) {
      return getLabel(element.element) + element.element.id;
    });
    return elements;
  };
  
  /**
   * @param {Token[]} tokens
   *
   * @return {boolean}
   */
  function hasMatched(tokens) {
    var matched = filter(tokens, function(token) {
      return token && !!token.matched;
    });
  
    return matched.length > 0;
  }
  
  /**
   * @param {string} text
   * @param {string} pattern
   *
   * @return {Token[]}
   */
  function matchAndSplit(text, pattern) {
    var tokens = [];
  
    if (!text) {
      return tokens;
    }
  
    var originalText = text;

    if (typeof text === 'string') {
      text = text.toLowerCase();
    } else {
      return;
    }

    pattern = pattern.toLowerCase();
  
    var i = text.indexOf(pattern);
  
    if (i > -1) {
      if (i !== 0) {
        tokens.push({
          normal: originalText.substr(0, i)
        });
      }
  
      tokens.push({
        matched: originalText.substr(i, pattern.length)
      });
  
      if (pattern.length + i < text.length) {
        tokens.push({
          normal: originalText.substr(pattern.length + i, text.length)
        });
      }
    } else {
      tokens.push({
        normal: originalText
      });
    }
  
    return tokens;
  }

  