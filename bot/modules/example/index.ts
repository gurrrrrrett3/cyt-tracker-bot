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