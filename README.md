# Saynplay

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.5.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).



// Notes

When I get a new board, i have to animate all of the change pieces to their new positions
I cant add them again as that would be pretty slow

When I send the game, I could send the old coors and the new coors so that i will know which coors to update
Additionally, I will send the piece that was moved
it will be a list of the following form

[
 old: {row: number, col: number}, new: {row: number, col: number}, piece: {'color': string, 'name': string}
 old: {row: number, col: number}, new: {row: number, col: number}, piece: {'color': string, 'name': string}
]

Then when I get a game update, first iterate through this list of dictionaries

const row = data.old.row
const col = data.old.col

Look through the scenes children to find the object that matches up with the piece
Do this based on the file name that we can construct from the piece data

Once i have the child, animate it from its current position to its new position

const newRow = data.new.row
const newCol = data.new.col


