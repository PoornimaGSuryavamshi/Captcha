/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'Captcha.Application',

    name: 'Captcha',

    requires: [
        // This will automatically load all classes in the Captcha namespace
        // so that application classes do not need to require each other.
        'Captcha.*'
    ],

    // The name of the initial view to create.
    mainView: 'Captcha.view.main.Main'
});
