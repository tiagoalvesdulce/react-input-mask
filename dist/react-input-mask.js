(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react'), require('react-dom')) :
  typeof define === 'function' && define.amd ? define(['react', 'react-dom'], factory) :
  (global.ReactInputMask = factory(global.React,null));
}(this, (function (React,ReactDOM) { 'use strict';

  React = React && React.hasOwnProperty('default') ? React['default'] : React;
  ReactDOM = ReactDOM && ReactDOM.hasOwnProperty('default') ? ReactDOM['default'] : ReactDOM;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype.__proto__ = superClass && superClass.prototype;
    subClass.__proto__ = superClass;
  }

  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }

    return target;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var defaultFormatChars = {
    '9': '[0-9]',
    'a': '[A-Za-z]',
    '*': '[A-Za-z0-9]'
  };
  var defaultMaskChar = '_';

  function parseMask (mask, maskChar, formatChars) {
    if (maskChar === undefined) {
      maskChar = defaultMaskChar;
    }

    if (formatChars == null) {
      formatChars = defaultFormatChars;
    }

    if (!mask || typeof mask !== 'string') {
      return {
        maskChar: maskChar,
        formatChars: formatChars,
        mask: null,
        prefix: null,
        lastEditablePos: null,
        permanents: []
      };
    }

    var str = '';
    var prefix = '';
    var permanents = [];
    var isPermanent = false;
    var lastEditablePos = null;
    mask.split('').forEach(function (character) {
      if (!isPermanent && character === '\\') {
        isPermanent = true;
      } else {
        if (isPermanent || !formatChars[character]) {
          permanents.push(str.length);

          if (str.length === permanents.length - 1) {
            prefix += character;
          }
        } else {
          lastEditablePos = str.length + 1;
        }

        str += character;
        isPermanent = false;
      }
    });
    return {
      maskChar: maskChar,
      formatChars: formatChars,
      prefix: prefix,
      mask: str,
      lastEditablePos: lastEditablePos,
      permanents: permanents
    };
  }

  function isWindowsPhoneBrowser() {
    var windows = new RegExp('windows', 'i');
    var phone = new RegExp('phone', 'i');
    var ua = navigator.userAgent;
    return windows.test(ua) && phone.test(ua);
  }

  function isPermanentChar(maskOptions, pos) {
    return maskOptions.permanents.indexOf(pos) !== -1;
  }
  function isAllowedChar(maskOptions, pos, character) {
    var mask = maskOptions.mask,
        formatChars = maskOptions.formatChars;

    if (!character) {
      return false;
    }

    if (isPermanentChar(maskOptions, pos)) {
      return mask[pos] === character;
    }

    var ruleChar = mask[pos];
    var charRule = formatChars[ruleChar];
    return new RegExp(charRule).test(character);
  }
  function isEmpty(maskOptions, value) {
    return value.split('').every(function (character, i) {
      return isPermanentChar(maskOptions, i) || !isAllowedChar(maskOptions, i, character);
    });
  }
  function getFilledLength(maskOptions, value) {
    var maskChar = maskOptions.maskChar,
        prefix = maskOptions.prefix;

    if (!maskChar) {
      while (value.length > prefix.length && isPermanentChar(maskOptions, value.length - 1)) {
        value = value.slice(0, value.length - 1);
      }

      return value.length;
    }

    var filledLength = prefix.length;

    for (var i = value.length; i >= prefix.length; i--) {
      var character = value[i];
      var isEnteredCharacter = !isPermanentChar(maskOptions, i) && isAllowedChar(maskOptions, i, character);

      if (isEnteredCharacter) {
        filledLength = i + 1;
        break;
      }
    }

    return filledLength;
  }
  function isFilled(maskOptions, value) {
    return getFilledLength(maskOptions, value) === maskOptions.mask.length;
  }
  function formatValue(maskOptions, value) {
    var maskChar = maskOptions.maskChar,
        mask = maskOptions.mask,
        prefix = maskOptions.prefix;

    if (!maskChar) {
      value = insertString(maskOptions, '', value, 0);

      if (value.length < prefix.length) {
        value = prefix;
      }

      while (value.length < mask.length && isPermanentChar(maskOptions, value.length)) {
        value += mask[value.length];
      }

      return value;
    }

    if (value) {
      var emptyValue = formatValue(maskOptions, '');
      return insertString(maskOptions, emptyValue, value, 0);
    }

    for (var i = 0; i < mask.length; i++) {
      if (isPermanentChar(maskOptions, i)) {
        value += mask[i];
      } else {
        value += maskChar;
      }
    }

    return value;
  }
  function clearRange(maskOptions, value, start, len) {
    var end = start + len;
    var maskChar = maskOptions.maskChar,
        mask = maskOptions.mask,
        prefix = maskOptions.prefix;
    var arrayValue = value.split('');

    if (!maskChar) {
      // remove any permanent chars after clear range, they will be added back by formatValue
      for (var i = end; i < arrayValue.length; i++) {
        if (isPermanentChar(maskOptions, i)) {
          arrayValue[i] = '';
        }
      }

      start = Math.max(prefix.length, start);
      arrayValue.splice(start, end - start);
      value = arrayValue.join('');
      return formatValue(maskOptions, value);
    }

    return arrayValue.map(function (character, i) {
      if (i < start || i >= end) {
        return character;
      }

      if (isPermanentChar(maskOptions, i)) {
        return mask[i];
      }

      return maskChar;
    }).join('');
  }
  function insertString(maskOptions, value, insertStr, insertPos) {
    var mask = maskOptions.mask,
        maskChar = maskOptions.maskChar,
        prefix = maskOptions.prefix;
    var arrayInsertStr = insertStr.split('');
    var isInputFilled = isFilled(maskOptions, value);

    var isUsablePosition = function isUsablePosition(pos, character) {
      return !isPermanentChar(maskOptions, pos) || character === mask[pos];
    };

    var isUsableCharacter = function isUsableCharacter(character, pos) {
      return !maskChar || !isPermanentChar(maskOptions, pos) || character !== maskChar;
    };

    if (!maskChar && insertPos > value.length) {
      value += mask.slice(value.length, insertPos);
    }

    arrayInsertStr.every(function (insertCharacter) {
      while (!isUsablePosition(insertPos, insertCharacter)) {
        if (insertPos >= value.length) {
          value += mask[insertPos];
        }

        if (!isUsableCharacter(insertCharacter, insertPos)) {
          return true;
        }

        insertPos++; // stop iteration if maximum value length reached

        if (insertPos >= mask.length) {
          return false;
        }
      }

      var isAllowed = isAllowedChar(maskOptions, insertPos, insertCharacter) || insertCharacter === maskChar;

      if (!isAllowed) {
        return true;
      }

      if (insertPos < value.length) {
        if (maskChar || isInputFilled || insertPos < prefix.length) {
          value = value.slice(0, insertPos) + insertCharacter + value.slice(insertPos + 1);
        } else {
          value = value.slice(0, insertPos) + insertCharacter + value.slice(insertPos);
          value = formatValue(maskOptions, value);
        }
      } else if (!maskChar) {
        value += insertCharacter;
      }

      insertPos++; // stop iteration if maximum value length reached

      return insertPos < mask.length;
    });
    return value;
  }
  function getInsertStringLength(maskOptions, value, insertStr, insertPos) {
    var mask = maskOptions.mask,
        maskChar = maskOptions.maskChar;
    var arrayInsertStr = insertStr.split('');
    var initialInsertPos = insertPos;

    var isUsablePosition = function isUsablePosition(pos, character) {
      return !isPermanentChar(maskOptions, pos) || character === mask[pos];
    };

    arrayInsertStr.every(function (insertCharacter) {
      while (!isUsablePosition(insertPos, insertCharacter)) {
        insertPos++; // stop iteration if maximum value length reached

        if (insertPos >= mask.length) {
          return false;
        }
      }

      var isAllowed = isAllowedChar(maskOptions, insertPos, insertCharacter) || insertCharacter === maskChar;

      if (isAllowed) {
        insertPos++;
      } // stop iteration if maximum value length reached


      return insertPos < mask.length;
    });
    return insertPos - initialInsertPos;
  }

  function defer (fn) {
    var defer = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function () {
      return setTimeout(fn, 0);
    };

    return defer(fn);
  }

  var InputElement =
  /*#__PURE__*/
  function (_React$Component) {
    function InputElement(props) {
      var _this;

      _this = _React$Component.call(this, props) || this;

      _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "lastCursorPos", null), "focused", false), "isDOMElement", function (element) {
        return typeof HTMLElement === 'object' ? element instanceof HTMLElement // DOM2
        : element.nodeType === 1 && typeof element.nodeName === 'string';
      }), "getInputDOMNode", function () {
        var input = _this.input;

        if (!input) {
          return null;
        }

        if (_this.isDOMElement(input)) {
          return input;
        }

        return ReactDOM.findDOMNode(input);
      }), "getInputValue", function () {
        var input = _this.getInputDOMNode();

        if (!input) {
          return null;
        }

        return input.value;
      }), "setInputValue", function (value) {
        var input = _this.getInputDOMNode();

        if (!input) {
          return;
        }

        _this.value = value;
        input.value = value;
      }), "getLeftEditablePos", function (pos) {
        for (var i = pos; i >= 0; --i) {
          if (!isPermanentChar(_this.maskOptions, i)) {
            return i;
          }
        }

        return null;
      }), "getRightEditablePos", function (pos) {
        var mask = _this.maskOptions.mask;

        for (var i = pos; i < mask.length; ++i) {
          if (!isPermanentChar(_this.maskOptions, i)) {
            return i;
          }
        }

        return null;
      }), "setCursorToEnd", function () {
        var filledLen = getFilledLength(_this.maskOptions, _this.value);

        var pos = _this.getRightEditablePos(filledLen);

        if (pos !== null) {
          _this.setCursorPos(pos);
        }
      }), "setSelection", function (start, len) {
        if (len === void 0) {
          len = 0;
        }

        var input = _this.getInputDOMNode();

        if (!input) {
          return;
        }

        var end = start + len;

        if ('selectionStart' in input && 'selectionEnd' in input) {
          input.selectionStart = start;
          input.selectionEnd = end;
        } else {
          var range = input.createTextRange();
          range.collapse(true);
          range.moveStart('character', start);
          range.moveEnd('character', end - start);
          range.select();
        }
      }), "getSelection", function () {
        var input = _this.getInputDOMNode();

        var start = 0;
        var end = 0;

        if ('selectionStart' in input && 'selectionEnd' in input) {
          start = input.selectionStart;
          end = input.selectionEnd;
        } else {
          var range = document.selection.createRange();

          if (range.parentElement() === input) {
            start = -range.moveStart('character', -input.value.length);
            end = -range.moveEnd('character', -input.value.length);
          }
        }

        return {
          start: start,
          end: end,
          length: end - start
        };
      }), "getCursorPos", function () {
        return _this.getSelection().start;
      }), "setCursorPos", function (pos) {
        _this.setSelection(pos, 0);

        defer(function () {
          _this.setSelection(pos, 0);
        });
        _this.lastCursorPos = pos;
      }), "isFocused", function () {
        return _this.focused;
      }), "getStringValue", function (value) {
        return !value && value !== 0 ? '' : value + '';
      }), "getModifyMaskedValueConfig", function () {
        var _this$maskOptions = _this.maskOptions,
            mask = _this$maskOptions.mask,
            maskChar = _this$maskOptions.maskChar,
            permanents = _this$maskOptions.permanents,
            formatChars = _this$maskOptions.formatChars;
        var alwaysShowMask = _this.props.alwaysShowMask;
        return {
          mask: mask,
          maskChar: maskChar,
          permanents: permanents,
          alwaysShowMask: !!alwaysShowMask,
          formatChars: formatChars
        };
      }), "onKeyDown", function (event) {
        _this.backspaceOrDeleteRemoval = null;

        if (typeof _this.props.onKeyDown === 'function') {
          _this.props.onKeyDown(event);
        }

        var key = event.key,
            ctrlKey = event.ctrlKey,
            metaKey = event.metaKey,
            defaultPrevented = event.defaultPrevented;

        if (ctrlKey || metaKey || defaultPrevented) {
          return;
        }

        if (key === 'Backspace' || key === 'Delete') {
          var selection = _this.getSelection();

          var canRemove = key === 'Backspace' && selection.end > 0 || key === 'Delete' && _this.value.length > selection.start;

          if (!canRemove) {
            return;
          }

          _this.backspaceOrDeleteRemoval = {
            key: key,
            selection: _this.getSelection()
          };
        }
      }), "onChange", function (event) {
        var _assertThisInitialize = _assertThisInitialized(_assertThisInitialized(_this)),
            beforePasteState = _assertThisInitialize.beforePasteState;

        var beforeChange = _this.props.beforeChange;
        var _this$maskOptions2 = _this.maskOptions,
            mask = _this$maskOptions2.mask,
            maskChar = _this$maskOptions2.maskChar,
            lastEditablePos = _this$maskOptions2.lastEditablePos,
            prefix = _this$maskOptions2.prefix;

        var value = _this.getInputValue();

        if (beforePasteState) {
          _this.beforePasteState = null;

          _this.pasteText(beforePasteState.value, value, beforePasteState.selection, event);

          return;
        }

        var oldValue = _this.value;

        var input = _this.getInputDOMNode(); // autofill replaces whole value, ignore old one
        // https://github.com/sanniassin/react-input-mask/issues/113
        //
        // input.matches throws exception if selector isn't supported


        try {
          if (typeof input.matches === 'function' && input.matches(':-webkit-autofill')) {
            oldValue = '';
          }
        } catch (e) {}

        var selection = _this.getSelection();

        var cursorPos = selection.end;
        var maskLen = mask.length;
        var valueLen = value.length;
        var oldValueLen = oldValue.length;
        var clearedValue;
        var enteredString;

        if (_this.backspaceOrDeleteRemoval) {
          var deleteFromRight = _this.backspaceOrDeleteRemoval.key === 'Delete';
          value = _this.value;
          selection = _this.backspaceOrDeleteRemoval.selection;
          cursorPos = selection.start;
          _this.backspaceOrDeleteRemoval = null;

          if (selection.length) {
            value = clearRange(_this.maskOptions, value, selection.start, selection.length);
          } else if (selection.start < prefix.length || !deleteFromRight && selection.start === prefix.length) {
            cursorPos = prefix.length;
          } else {
            var editablePos = deleteFromRight ? _this.getRightEditablePos(cursorPos) : _this.getLeftEditablePos(cursorPos - 1);

            if (editablePos !== null) {
              if (!maskChar) {
                value = value.substr(0, getFilledLength(_this.maskOptions, value));
              }

              value = clearRange(_this.maskOptions, value, editablePos, 1);
              cursorPos = editablePos;
            }
          }
        } else if (valueLen > oldValueLen) {
          var enteredStringLen = valueLen - oldValueLen;
          var startPos = selection.end - enteredStringLen;
          enteredString = value.substr(startPos, enteredStringLen);

          if (startPos < lastEditablePos && (enteredStringLen !== 1 || enteredString !== mask[startPos])) {
            cursorPos = _this.getRightEditablePos(startPos);
          } else {
            cursorPos = startPos;
          }

          value = value.substr(0, startPos) + value.substr(startPos + enteredStringLen);
          clearedValue = clearRange(_this.maskOptions, value, startPos, maskLen - startPos);
          clearedValue = insertString(_this.maskOptions, clearedValue, enteredString, cursorPos);
          value = insertString(_this.maskOptions, oldValue, enteredString, cursorPos);

          if (enteredStringLen !== 1 || cursorPos >= prefix.length && cursorPos < lastEditablePos) {
            cursorPos = Math.max(getFilledLength(_this.maskOptions, clearedValue), cursorPos);

            if (cursorPos < lastEditablePos) {
              cursorPos = _this.getRightEditablePos(cursorPos);
            }
          } else if (cursorPos < lastEditablePos) {
            cursorPos++;
          }
        } else if (valueLen < oldValueLen) {
          var removedLen = maskLen - valueLen;
          enteredString = value.substr(0, selection.end);
          var clearOnly = enteredString === oldValue.substr(0, selection.end);
          clearedValue = clearRange(_this.maskOptions, oldValue, selection.end, removedLen);

          if (maskChar) {
            value = insertString(_this.maskOptions, clearedValue, enteredString, 0);
          }

          clearedValue = clearRange(_this.maskOptions, clearedValue, selection.end, maskLen - selection.end);
          clearedValue = insertString(_this.maskOptions, clearedValue, enteredString, 0);

          if (!clearOnly) {
            cursorPos = Math.max(getFilledLength(_this.maskOptions, clearedValue), cursorPos);

            if (cursorPos < lastEditablePos) {
              cursorPos = _this.getRightEditablePos(cursorPos);
            }
          } else if (cursorPos < prefix.length) {
            cursorPos = prefix.length;
          }
        }

        value = formatValue(_this.maskOptions, value);

        if (!enteredString) {
          enteredString = null;
        }

        if (typeof beforeChange === 'function') {
          var modifiedValue = beforeChange(value, cursorPos, enteredString, _this.getModifyMaskedValueConfig());
          value = modifiedValue.value;
          cursorPos = modifiedValue.cursorPosition;
        }

        _this.setInputValue(value);

        if (typeof _this.props.onChange === 'function') {
          _this.props.onChange(event);
        }

        if (_this.isWindowsPhoneBrowser) {
          defer(function () {
            _this.setSelection(cursorPos, 0);
          });
        } else {
          _this.setCursorPos(cursorPos);
        }
      }), "onFocus", function (event) {
        var beforeChange = _this.props.beforeChange;
        var _this$maskOptions3 = _this.maskOptions,
            mask = _this$maskOptions3.mask,
            prefix = _this$maskOptions3.prefix;
        _this.focused = true;

        if (mask) {
          if (!_this.value) {
            var value = formatValue(_this.maskOptions, prefix);
            var inputValue = formatValue(_this.maskOptions, value);
            var filledLen = getFilledLength(_this.maskOptions, inputValue);

            var cursorPos = _this.getRightEditablePos(filledLen);

            if (typeof beforeChange === 'function') {
              var modifiedValue = beforeChange(inputValue, cursorPos, null, _this.getModifyMaskedValueConfig());
              inputValue = modifiedValue.value;
              cursorPos = modifiedValue.cursorPosition;
            } // do not use this.getInputValue and this.setInputValue as this.input
            // can be undefined at this moment if autoFocus attribute is set


            var isInputValueChanged = inputValue !== event.target.value;

            if (isInputValueChanged) {
              event.target.value = inputValue;
            }

            _this.value = inputValue;

            if (isInputValueChanged && typeof _this.props.onChange === 'function') {
              _this.props.onChange(event);
            }

            _this.setCursorPos(cursorPos);
          } else if (getFilledLength(_this.maskOptions, _this.value) < _this.maskOptions.mask.length) {
            _this.setCursorToEnd();
          }
        }

        if (typeof _this.props.onFocus === 'function') {
          _this.props.onFocus(event);
        }
      }), "onBlur", function (event) {
        var beforeChange = _this.props.beforeChange;
        var mask = _this.maskOptions.mask;
        _this.focused = false;

        if (mask && !_this.props.alwaysShowMask && isEmpty(_this.maskOptions, _this.value)) {
          var inputValue = '';

          if (typeof beforeChange === 'function') {
            var modifiedValue = beforeChange(inputValue, null, null, _this.getModifyMaskedValueConfig());
            inputValue = modifiedValue.value;
          }

          var isInputValueChanged = inputValue !== _this.getInputValue();

          if (isInputValueChanged) {
            _this.setInputValue(inputValue);
          }

          if (isInputValueChanged && typeof _this.props.onChange === 'function') {
            _this.props.onChange(event);
          }
        }

        if (typeof _this.props.onBlur === 'function') {
          _this.props.onBlur(event);
        }
      }), "onMouseDown", function (event) {
        // tiny unintentional mouse movements can break cursor
        // position on focus, so we have to restore it in that case
        //
        // https://github.com/sanniassin/react-input-mask/issues/108
        if (!_this.focused && document.addEventListener) {
          _this.mouseDownX = event.clientX;
          _this.mouseDownY = event.clientY;
          _this.mouseDownTime = new Date().getTime();

          var mouseUpHandler = function mouseUpHandler(mouseUpEvent) {
            document.removeEventListener('mouseup', mouseUpHandler);

            if (!_this.focused) {
              return;
            }

            var deltaX = Math.abs(mouseUpEvent.clientX - _this.mouseDownX);
            var deltaY = Math.abs(mouseUpEvent.clientY - _this.mouseDownY);
            var axisDelta = Math.max(deltaX, deltaY);

            var timeDelta = new Date().getTime() - _this.mouseDownTime;

            if (axisDelta <= 10 && timeDelta <= 200 || axisDelta <= 5 && timeDelta <= 300) {
              _this.setCursorToEnd();
            }
          };

          document.addEventListener('mouseup', mouseUpHandler);
        }

        if (typeof _this.props.onMouseDown === 'function') {
          _this.props.onMouseDown(event);
        }
      }), "onPaste", function (event) {
        if (typeof _this.props.onPaste === 'function') {
          _this.props.onPaste(event);
        } // we need raw pasted text, but event.clipboardData
        // may not work in Android browser, so we clean input
        // to get raw text in onChange handler


        if (!event.defaultPrevented) {
          _this.beforePasteState = {
            value: _this.getInputValue(),
            selection: _this.getSelection()
          };

          _this.setInputValue('');
        }
      }), "pasteText", function (value, text, selection, event) {
        var beforeChange = _this.props.beforeChange;
        var cursorPos = selection.start;

        if (selection.length) {
          value = clearRange(_this.maskOptions, value, cursorPos, selection.length);
        }

        var textLen = getInsertStringLength(_this.maskOptions, value, text, cursorPos);
        value = insertString(_this.maskOptions, value, text, cursorPos);
        cursorPos += textLen;
        cursorPos = _this.getRightEditablePos(cursorPos) || cursorPos;

        if (typeof beforeChange === 'function') {
          var modifiedValue = beforeChange(value, cursorPos, text, _this.getModifyMaskedValueConfig());
          value = modifiedValue.value;
          cursorPos = modifiedValue.cursorPosition;
        }

        _this.setInputValue(value);

        if (event && typeof _this.props.onChange === 'function') {
          _this.props.onChange(event);
        }

        _this.setCursorPos(cursorPos);
      }), "handleRef", function (ref) {
        _this.input = ref;

        if (typeof _this.props.inputRef === 'function') {
          _this.props.inputRef(ref);
        }
      });

      var _mask = props.mask,
          _maskChar = props.maskChar,
          _formatChars = props.formatChars,
          defaultValue = props.defaultValue,
          _value = props.value,
          _alwaysShowMask = props.alwaysShowMask;
      _this.hasValue = _value != null;
      _this.maskOptions = parseMask(_mask, _maskChar, _formatChars);

      if (defaultValue == null) {
        defaultValue = '';
      }

      if (_value == null) {
        _value = defaultValue;
      }

      _value = _this.getStringValue(_value);

      if (_this.maskOptions.mask && (_alwaysShowMask || _value)) {
        _value = formatValue(_this.maskOptions, _value);
      }

      _this.value = _value;
      return _this;
    }

    var _proto = InputElement.prototype;

    _proto.componentDidMount = function componentDidMount() {
      this.isWindowsPhoneBrowser = isWindowsPhoneBrowser();

      if (this.maskOptions.mask && this.getInputValue() !== this.value) {
        this.setInputValue(this.value);
      }

      if (this.props.maxLength && this.maskOptions.mask && typeof console === 'object' && console.error) {
        console.error('react-input-mask: You shouldn\'t pass maxLength property to the masked input. It breaks masking and unnecessary because length is limited by the mask length.');
      }
    };

    _proto.componentDidUpdate = function componentDidUpdate() {
      var beforeChange = this.props.beforeChange;
      var oldMaskOptions = this.maskOptions;
      this.hasValue = this.props.value != null;
      this.maskOptions = parseMask(this.props.mask, this.props.maskChar, this.props.formatChars);

      if (!this.maskOptions.mask) {
        this.backspaceOrDeleteRemoval = null;
        this.lastCursorPos = null;
        return;
      }

      var cursorPos = this.lastCursorPos;
      var isMaskChanged = this.maskOptions.mask && this.maskOptions.mask !== oldMaskOptions.mask;
      var showEmpty = this.props.alwaysShowMask || this.isFocused();
      var newValue = this.hasValue ? this.getStringValue(this.props.value) : this.value;

      if (!oldMaskOptions.mask && !this.hasValue) {
        newValue = this.getInputValue();
      }

      if (isMaskChanged || this.maskOptions.mask && (newValue || showEmpty)) {
        newValue = formatValue(this.maskOptions, newValue);

        if (isMaskChanged) {
          var filledLen = getFilledLength(this.maskOptions, newValue);

          if (cursorPos === null || filledLen < cursorPos) {
            if (isFilled(this.maskOptions, newValue)) {
              cursorPos = filledLen;
            } else {
              cursorPos = this.getRightEditablePos(filledLen);
            }
          }
        }
      }

      if (this.maskOptions.mask && isEmpty(this.maskOptions, newValue) && !showEmpty && (!this.hasValue || !this.props.value)) {
        newValue = '';
      }

      if (typeof beforeChange === 'function') {
        var modifiedValue = beforeChange(newValue, cursorPos, null, this.getModifyMaskedValueConfig());
        newValue = modifiedValue.value;
        cursorPos = modifiedValue.cursorPosition;
      }

      this.value = newValue;

      if (cursorPos !== this.lastCursorPos) {
        this.setCursorPos(cursorPos);
      }

      if (this.maskOptions.mask && this.getInputValue() !== this.value) {
        this.setInputValue(this.value);
        this.forceUpdate();
      }
    };

    _proto.render = function render() {
      var _this2 = this;

      var _this$props = this.props,
          mask = _this$props.mask,
          alwaysShowMask = _this$props.alwaysShowMask,
          maskChar = _this$props.maskChar,
          formatChars = _this$props.formatChars,
          inputRef = _this$props.inputRef,
          CustomInput = _this$props.CustomInput,
          beforeChange = _this$props.beforeChange,
          props = _objectWithoutProperties(_this$props, ["mask", "alwaysShowMask", "maskChar", "formatChars", "inputRef", "CustomInput", "beforeChange"]);

      if (this.maskOptions.mask) {
        if (!props.disabled && !props.readOnly) {
          var handlersKeys = ['onChange', 'onKeyDown', 'onPaste', 'onMouseDown'];
          handlersKeys.forEach(function (key) {
            props[key] = _this2[key];
          });
        }

        if (props.value != null) {
          props.value = this.value;
        }
      }

      return CustomInput ? React.cloneElement(CustomInput, _objectSpread({
        ref: this.handleRef,
        onFocus: this.onFocus,
        onBlur: this.onBlur
      }, props)) : React.createElement("input", _extends({
        ref: this.handleRef
      }, props, {
        onFocus: this.onFocus,
        onBlur: this.onBlur
      }));
    };

    _inheritsLoose(InputElement, _React$Component);

    return InputElement;
  }(React.Component);

  return InputElement;

})));
