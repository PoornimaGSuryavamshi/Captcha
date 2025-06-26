/**
 * Custom ExtJS Captcha Component
 * Integrates Google reCAPTCHA with ExtJS framework
 */
Ext.define('Ext.captcha.ReCaptcha', {
    extend: 'Ext.Component',
    xtype: 'recaptcha',
    
    config: {
        /**
         * @cfg {String} siteKey (required)
         * The reCAPTCHA site key from Google
         */
        siteKey: null,
        
        /**
         * @cfg {Boolean} useRecaptchaNet
         * Whether to use recaptcha.net domain instead of google.com
         */
        useRecaptchaNet: false,
        
        /**
         * @cfg {Boolean} useEnterprise
         * Whether to use Enterprise reCAPTCHA
         */
        useEnterprise: false,
        
        /**
         * @cfg {Object} renderParameters
         * Additional parameters for reCAPTCHA rendering
         */
        renderParameters: {},
        
        /**
         * @cfg {String} customUrl
         * Custom URL for reCAPTCHA script (overrides other URL settings)
         */
        customUrl: '',
        
        /**
         * @cfg {String} theme
         * Theme for reCAPTCHA widget ('light' or 'dark')
         */
        theme: 'light',
        
        /**
         * @cfg {String} size
         * Size of reCAPTCHA widget ('normal', 'compact', or 'invisible')
         */
        size: 'normal',
        
        /**
         * @cfg {String} type
         * Type of reCAPTCHA challenge ('image' or 'audio')
         */
        type: 'image',
        
        /**
         * @cfg {Number} tabindex
         * Tab index for the reCAPTCHA widget
         */
        tabindex: 0,
        
        /**
         * @cfg {String} response
         * The current captcha response token (published property)
         */
        response: null
    },
    
    /**
     * @property {Number} widgetId
     * The reCAPTCHA widget ID returned by grecaptcha.render()
     */
    widgetId: null,
    
    /**
     * @property {Boolean} scriptLoaded
     * Whether the reCAPTCHA script has been loaded
     */
    scriptLoaded: false,
    
    /**
     * @property {Promise} scriptPromise
     * Promise for script loading to avoid multiple loads
     */
    scriptPromise: null,
    
    /**
     * @property {Object} publishes
     * Published properties that fire events when changed
     */
    publishes: {
        response: true
    },

    /**
     * @property {String[]} eventNames
     * List of events that this component fires
     */
    eventNames: [
        /**
         * @event captchaload
         * Fires when the captcha script is loaded and ready
         * @param {Ext.ux.Captcha} this
         */
        'captchaload',
        
        /**
         * @event captcharender
         * Fires when the captcha widget is rendered
         * @param {Ext.ux.Captcha} this
         * @param {Number} widgetId
         */
        'captcharender',
        
        /**
         * @event captcharesponse
         * Fires when user completes the captcha
         * @param {Ext.ux.Captcha} this
         * @param {String} response
         */
        'captcharesponse',
        
        /**
         * @event captchaexpired
         * Fires when the captcha response expires
         * @param {Ext.ux.Captcha} this
         */
        'captchaexpired',
        
        /**
         * @event captchaerror
         * Fires when there's an error with the captcha
         * @param {Ext.ux.Captcha} this
         * @param {Error} error
         */
        'captchaerror'
    ],
    
    // Component lifecycle
    initComponent: function() {
        var me = this;
        
        me.callParent();
        
        // Validate required config
        if (!me.getSiteKey()) {
            Ext.Error.raise('siteKey is required for Captcha component');
        }
    },
    
    onRender: function() {
        var me = this;
        me.callParent(arguments);
        
        // Create container div for reCAPTCHA
        me.captchaEl = me.el.createChild({
            tag: 'div',
            id: me.id + '-captcha-container'
        });
        
        // Load and render captcha
        me.loadAndRenderCaptcha();
    },
    
    /**
     * Load the reCAPTCHA script and render the widget
     */
    loadAndRenderCaptcha: function() {
        var me = this;
        
        if (!me.scriptPromise) {
            me.scriptPromise = me.loadScript(
                me.getSiteKey(),
                me.getUseRecaptchaNet(),
                me.getUseEnterprise(),
                me.getRenderParameters(),
                me.getCustomUrl()
            );
        }
        
        me.scriptPromise.then(function(scriptElement) {
            me.scriptLoaded = true;
            me.fireEvent('captchaload', me);
            me.renderCaptcha();
        }).catch(function(error) {
            me.fireEvent('captchaerror', me, error);
        });
    },
    
    /**
     * Render the reCAPTCHA widget
     */
    renderCaptcha: function() {
        var me = this;
        
        if (!me.scriptLoaded || !window.grecaptcha || !me.captchaEl) {
            return;
        }
        
        try {
            me.widgetId = grecaptcha.render(me.captchaEl.id, {
                sitekey: me.getSiteKey(),
                theme: me.getTheme(),
                size: me.getSize(),
                type: me.getType(),
                tabindex: me.getTabindex(),
                callback: function(response) {
                    me.setResponse(response); // This will fire the responsechange event via publishes
                    me.fireEvent('captcharesponse', me, response);
                },
                'expired-callback': function() {
                    me.fireEvent('captchaexpired', me);
                },
                'error-callback': function() {
                    me.fireEvent('captchaerror', me, new Error('reCAPTCHA error'));
                }
            });
            
            me.fireEvent('captcharender', me, me.widgetId);
        } catch (error) {
            me.fireEvent('captchaerror', me, error);
        }
    },
    
    /**
     * Load the reCAPTCHA script (adapted from your provided code)
     */
    loadScript: function(siteKey, useRecaptchaNet, useEnterprise, renderParameters, customUrl) {
        var me = this;
        
        // Create script element
        var scriptElement = document.createElement("script");
        scriptElement.setAttribute("recaptcha-v3-script", "");
        scriptElement.setAttribute("async", "");
        scriptElement.setAttribute("defer", "");
        
        var scriptBase = "https://www.google.com/recaptcha/api.js";
        if (useRecaptchaNet) {
            if (useEnterprise) {
                scriptBase = "https://recaptcha.net/recaptcha/enterprise.js";
            } else {
                scriptBase = "https://recaptcha.net/recaptcha/api.js";
            }
        } else if (useEnterprise) {
            scriptBase = "https://www.google.com/recaptcha/enterprise.js";
        }
        
        if (customUrl) {
            scriptBase = customUrl;
        }
        
        // Remove the 'render' property
        if (renderParameters.render) {
            renderParameters.render = undefined;
        }
        
        // Build parameter query string
        var parametersQuery = me.buildQueryString(renderParameters);
        scriptElement.src = scriptBase + "?render=explicit" + parametersQuery;
        
        return new Promise(function(resolve, reject) {
            scriptElement.addEventListener(
                "load",
                me.waitForScriptToLoad(function() {
                    resolve(scriptElement);
                }, useEnterprise),
                false
            );
            
            scriptElement.onerror = function(error) {
                reject(error);
            };
            
            document.head.appendChild(scriptElement);
        });
    },
    
    /**
     * Build query string from parameters object
     */
    buildQueryString: function(params) {
        var query = '';
        for (var key in params) {
            if (params.hasOwnProperty(key) && params[key] !== undefined) {
                query += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
            }
        }
        return query;
    },
    
    /**
     * Wait for script to load and grecaptcha to be available
     */
    waitForScriptToLoad: function(callback, useEnterprise) {
        return function() {
            var checkReady = function() {
                if (useEnterprise && window.grecaptcha && window.grecaptcha.enterprise) {
                    callback();
                } else if (!useEnterprise && window.grecaptcha && window.grecaptcha.render) {
                    callback();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        };
    },
    
    /**
     * Get the current captcha response
     * @return {String} The captcha response token
     */
    getResponse: function() {
        var me = this;
        if (me.widgetId !== null && window.grecaptcha) {
            return grecaptcha.getResponse(me.widgetId);
        }
        return '';
    },
    
    /**
     * Reset the captcha widget
     */
    reset: function() {
        var me = this;
        if (me.widgetId !== null && window.grecaptcha) {
            grecaptcha.reset(me.widgetId);
        }
    },
    
    /**
     * Execute the captcha (for invisible captcha)
     */
    execute: function() {
        var me = this;
        if (me.widgetId !== null && window.grecaptcha) {
            grecaptcha.execute(me.widgetId);
        }
    },
    
    /**
     * Check if the captcha is valid (has response)
     * @return {Boolean}
     */
    isValid: function() {
        return this.getResponse().length > 0;
    },
    reset: function(){
        grecaptcha.reset(me.widgetId);
    },
    
    onDestroy: function() {
        var me = this;
        
        // Clean up the widget if it exists
        if (me.widgetId !== null && window.grecaptcha) {
            try {
                // Reset the widget to clear any pending state
                // grecaptcha.reset(me.widgetId);
                
                // Clear the widget element content to remove the reCAPTCHA
                if (me.captchaEl && me.captchaEl.dom) {
                    me.captchaEl.dom.innerHTML = '';
                }
                
                // Clear the widget ID reference
                me.widgetId = null;
            } catch (e) {
                // Ignore cleanup errors
            }
        }
        
        me.callParent();
    }
});