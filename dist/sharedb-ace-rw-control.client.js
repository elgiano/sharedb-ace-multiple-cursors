/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
throw new Error("Cannot find module \"./marker\"");


const colors = ['BurlyWood', 'PowderBlue', 'Violet', 'GreenYellow', 'Red', 'LimeGreen', 'DarkViolet', 'GhostWhite', 'OrangeRed', 'HotPink'];
const MAX_COLORS = 10;

function SharedbMultipleCursors(socket, ace) {
  console.log("starting mulitple cursors");
  const MAX_USERS = 50;

  const username = `user${Math.floor(Math.random() * MAX_USERS)}`;
  __WEBPACK_IMPORTED_MODULE_0__marker___default.a.init(ace);

  // Initialize User
  socket.addEventListener('open', () => {
    const message = {
      id: 'initUser',
      userName: username,
      cursor: ace.getCursorPosition()
    };
    socket.send(JSON.stringify(message));
  });

  // listen for local cursor changes
  ace.selection.on('changeCursor', () => {
    const message = {
      id: 'cursorChange',
      userName: username,
      cursor: ace.getCursorPosition()
    };

    socket.send(JSON.stringify(message));
  });

  socket.addEventListener('message', msg => {
    let message = null;
    try {
      message = JSON.parse(msg.data);
    } catch (e) {
      return;
    }

    switch (message.id) {
      case 'cursorChange':
        if (message.userName === username) break;

        if (!(message.userName in __WEBPACK_IMPORTED_MODULE_0__marker___default.a.cursors)) {
          __WEBPACK_IMPORTED_MODULE_0__marker___default.a.cursors[message.userName] = {
            cursor: message.cursor,
            color: colors[Math.floor(Math.random() * MAX_COLORS)]
          };
        } else {
          __WEBPACK_IMPORTED_MODULE_0__marker___default.a.cursors[message.userName].cursor = message.cursor;
        }
        __WEBPACK_IMPORTED_MODULE_0__marker___default.a.redraw();
        break;
      case 'removeUser':
        if (message.userName in __WEBPACK_IMPORTED_MODULE_0__marker___default.a.cursors) {
          delete __WEBPACK_IMPORTED_MODULE_0__marker___default.a.cursors[message.userName];
        }
        break;
      default:
    }
  });
}
/* harmony default export */ __webpack_exports__["default"] = (SharedbMultipleCursors);

/***/ })
/******/ ]);