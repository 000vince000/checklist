"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk"] = self["webpackChunk"] || []).push([["app_components_CompletedTasks_tsx"],{

/***/ "./app/components/CompletedTasks.tsx":
/*!*******************************************!*\
  !*** ./app/components/CompletedTasks.tsx ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var _context_TaskContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../context/TaskContext */ \"./app/context/TaskContext.tsx\");\n/* harmony import */ var _utils_taskUtils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/taskUtils */ \"./app/utils/taskUtils.ts\");\n/* harmony import */ var _styles_AppStyles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/AppStyles */ \"./app/styles/AppStyles.ts\");\n\n\n\n\nvar CompletedTasks = function () {\n    var completedTasks = (0,_context_TaskContext__WEBPACK_IMPORTED_MODULE_1__.useTaskContext)().completedTasks;\n    return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_styles_AppStyles__WEBPACK_IMPORTED_MODULE_3__.CompletedTasksSection, null, completedTasks.map(function (task) { return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_styles_AppStyles__WEBPACK_IMPORTED_MODULE_3__.CompletedTaskItem, { key: task.id },\n        task.name,\n        \" - Completed in: \",\n        (0,_utils_taskUtils__WEBPACK_IMPORTED_MODULE_2__.formatTime)(task.completionTime || 0))); })));\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CompletedTasks);\n\n\n//# sourceURL=webpack:///./app/components/CompletedTasks.tsx?");

/***/ })

}]);