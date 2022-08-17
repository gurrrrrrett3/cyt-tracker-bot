# How to create a module

1. Create a new folder here with the name of your module
2. inside the folder, create a file named `index.ts`
3. use the `module` snippet to create a base module
 - this is included below for anyone not using Visual Studio Code

 ```typescript

import Bot from "../../bot";
import BaseModule from "../../loaders/base/baseModule";
import { Module } from "../../loaders/loaderTypes";

export default class ExampleModule extends BaseModule implements Module {
   name = "example";
   description = "An example module";

   // declare other public variables here

   constructor(bot: Bot) {
         super(bot);
    }

    async init(bot: Bot) {

        // init code here, this is called when the module is loaded

    }

}

 ```