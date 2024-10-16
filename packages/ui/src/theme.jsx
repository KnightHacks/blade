"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeProvider = void 0;
exports.ThemeToggle = ThemeToggle;
var React = require("react");
var react_icons_1 = require("@radix-ui/react-icons");
var next_themes_1 = require("next-themes");
Object.defineProperty(exports, "ThemeProvider", {
  enumerable: true,
  get: function () {
    return next_themes_1.ThemeProvider;
  },
});
var button_1 = require("./button");
var dropdown_menu_1 = require("./dropdown-menu");
function ThemeToggle() {
  var setTheme = (0, next_themes_1.useTheme)().setTheme;
  return (
    <dropdown_menu_1.DropdownMenu>
      <dropdown_menu_1.DropdownMenuTrigger asChild>
        <button_1.Button variant="outline" size="icon">
          <react_icons_1.SunIcon className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <react_icons_1.MoonIcon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button_1.Button>
      </dropdown_menu_1.DropdownMenuTrigger>
      <dropdown_menu_1.DropdownMenuContent align="end">
        <dropdown_menu_1.DropdownMenuItem
          onClick={function () {
            return setTheme("light");
          }}
        >
          Light
        </dropdown_menu_1.DropdownMenuItem>
        <dropdown_menu_1.DropdownMenuItem
          onClick={function () {
            return setTheme("dark");
          }}
        >
          Dark
        </dropdown_menu_1.DropdownMenuItem>
        <dropdown_menu_1.DropdownMenuItem
          onClick={function () {
            return setTheme("system");
          }}
        >
          System
        </dropdown_menu_1.DropdownMenuItem>
      </dropdown_menu_1.DropdownMenuContent>
    </dropdown_menu_1.DropdownMenu>
  );
}
