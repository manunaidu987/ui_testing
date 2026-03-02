const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

class CustomWorld extends World {
    constructor(options) {
        super(options);
        this.browser = null;
        this.page = null;
    }
}

setWorldConstructor(CustomWorld);