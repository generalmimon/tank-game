# Simple tank game

A very simple tank game written in JavaScript. It uses HTML Canvas API. It doesn't depend on any library or engine. The collision detection algorithm is taken from https://github.com/sevdanski/SAT_AS3, it was just rewritten to JavaScript.

It consists of main game loop, which checks which keys are pressed, shifts the moving objects and checks collisions. The code isn't very nice. It should be more universal, the components are tied too tightly. All variables and functions are global.

(Open the game)[https://generalmimon.github.io/tank-game/index.html]
