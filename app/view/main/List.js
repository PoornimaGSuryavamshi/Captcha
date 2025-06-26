/**
 * This view is an example list of people.
 */
Ext.define('Captcha.view.main.List', {
    extend: 'Ext.panel.Panel',
    xtype: 'mainlist',
    height: 1000,
    // width: 1000,
    margin: '0 0 10 0',
    items: [
        {
            xtype: 'recaptcha',
            siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
            listeners: {
                captcharesponse: function (captcha, response) {
                    console.log('Captcha completed with response:', response);
                },
                captcharender: function (captcha, widgetId) {
                    console.log('Captcha rendered with ID:', widgetId);
                },
                captchaexpired: function (captcha) {
                    console.log('Captcha expired');
                },
                captchaerror: function (captcha, error) {
                    console.log('Captcha error:', error);
                }
            }
        },

        {
            xtype: 'recaptcha',
            siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
            theme: 'dark',
            size: 'compact',
            useRecaptchaNet: true,
            renderParameters: {
                hl: 'en'  // Language parameter
            },
            listeners: {
                captcharender: function (captcha, widgetId) {
                    console.log('Captcha rendered with ID:', widgetId);
                },
                captcharesponse: function (captcha, response) {
                    // Validate response on server
                    console.log('Validating response:', response);
                }
            }
        },
        {
            xtype: 'recaptcha',
            siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
            theme: 'dark',
            size: 'invisible',
            useRecaptchaNet: true,
            renderParameters: {
                hl: 'en'  // Language parameter
            },
            listeners: {
                captcharender: function (captcha, widgetId) {
                    console.log('Captcha rendered with ID:', widgetId);
                },
                captcharesponse: function (captcha, response) {
                    // Validate response on server
                    console.log('Validating response:', response);
                }
            }
        },
        {
            xtype: 'captcha',
            type: 'math'
            // type: 'alphanumeric'
        }]
});
