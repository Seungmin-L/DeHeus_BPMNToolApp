// Import the original class
import BpmnSearchProviderOriginal from 'bpmn-js/lib/features/search/BpmnSearchProvider';

// Import necessary utilities
import {
  map,
  filter,
  sortBy
} from 'min-dash';
import {
  getLabel
} from 'bpmn-js/lib/util/LabelUtil';

// Create a new class that extends the original class
class BpmnSearchProvider extends BpmnSearchProviderOriginal {

  // Override the find method
  find(pattern) {
    var rootElements = this._canvas.getRootElements();

    var elements = this._elementRegistry.filter(function(element) {
        console.log("search funtion");

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
      // Get the custom parameters of the element
      var customParameters = element.businessObject.get('custom:parameter');

      // Create a string of all parameter ids
      var parameterIds = customParameters.map(function(param) {
        return param.id;
      }).join(' ');
      console.log("search funtion");

      return {
        primaryTokens: this.matchAndSplit(getLabel(element), pattern),
        secondaryTokens: this.matchAndSplit(element.id, pattern),
        tertiaryTokens: this.matchAndSplit(parameterIds, pattern), // Add this line
        element: element,
      };
    }.bind(this)); // bind this to the callback function

    // exclude non-matched elements
    elements = filter(elements, function(element) {
      return this.hasMatched(element.primaryTokens) || this.hasMatched(element.secondaryTokens) || this.hasMatched(element.tertiaryTokens); // Modify this line
    }.bind(this)); // bind this to the callback function

    elements = sortBy(elements, function(element) {
      return getLabel(element.element) + element.element.id;
    });

    return elements;
  }

  // Helper methods
  hasMatched(tokens) {
    var matched = filter(tokens, function(token) {
      return !!token.matched;
    });

    return matched.length > 0;
  }

  matchAndSplit(text, pattern) {
    var tokens = [],
        originalText = text;

    if (!text) {
      return tokens;
    }

    text = text.toLowerCase();
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
}

export default BpmnSearchProvider;
