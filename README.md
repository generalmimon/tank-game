<!--
SPDX-FileCopyrightText: 2019 Petr Pucil <petr.pucil@seznam.cz>

SPDX-License-Identifier: CC0-1.0
-->

# Simple tank game

[![REUSE compliant](https://github.com/generalmimon/tank-game/actions/workflows/reuse-lint.yml/badge.svg)](
  https://github.com/generalmimon/tank-game/actions/workflows/reuse-lint.yml
)

A very simple tank game written in JavaScript. It is inspired by a well-known game Tank Trouble. It uses HTML Canvas API. It doesn't depend on any library or engine. The collision detection algorithm is taken from https://github.com/sevdanski/SAT_AS3, it was just rewritten to JavaScript.

It consists of main game loop, which checks which keys are pressed, shifts the moving objects and checks collisions. The code needs refacoring, the components are tied too tightly. For instance, there isn't easy way to add another tank (with mouse control) without altering the core of the program (main loop and almost all functions). The game shouldn't consist of many functions calling each other. Object-oriented design would be more convenient.

[Open the game](https://generalmimon.github.io/tank-game/index.html)
