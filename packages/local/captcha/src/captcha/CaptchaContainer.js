/**
 * ExtJS Pure Captcha Component
 * 
 * A focused captcha component that only handles challenge generation and validation.
 * UI integration is left to the user for maximum flexibility.
 */

Ext.define('Ext.captcha.CaptchaContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.captchacontainer',
    // alternateClassName: 'Ext.Captcha',

    requires: [
        'Ext.form.field.Text',
        'Ext.button.Button'
    ],

    /**
     * @cfg {String} type
     * Type of captcha challenge: 'alphanumeric' or 'math'
     */
    type: 'alphanumeric',

    /**
     * @cfg {Number} length
     * Length of alphanumeric challenge (default: 6)
     */
    length: 6,

    /**
     * @cfg {Boolean} caseSensitive
     * Whether the captcha is case sensitive (default: false)
     */
    caseSensitive: false,

    /**
     * @cfg {Boolean} allowBlank
     * Whether to allow empty answer field (default: false)
     */
    allowBlank: false,

    /**
     * @cfg {String} blankText
     * Error message when field is left blank (default: 'Please enter the captcha answer')
     */
    blankText: 'Please enter the captcha answer',

    /**
     * @cfg {Boolean} enableAudio
     * Enable audio accessibility feature (default: true)
     */
    enableAudio: true,

    /**
     * @cfg {Number} distortionLevel
     * Level of visual distortion 1-10 (default: 5)
     */
    distortionLevel: 5,

    /**
     * @cfg {Number} noiseLevel
     * Level of background noise 1-10 (default: 3)
     */
    noiseLevel: 3,

    /**
     * @cfg {Number} canvasWidth
     * Canvas width in pixels (default: 300)
     */
    canvasWidth: 300,

    /**
     * @cfg {Number} canvasHeight
     * Canvas height in pixels (default: 80)
     */
    canvasHeight: 80,

    /**
     * @event challengegenerated
     * Fired when a new captcha challenge is generated
     * @param {Ext.captcha.Captcha} this
     * @param {String} challenge The challenge text/question
     * @param {String} type The challenge type ('alphanumeric' or 'math')
     */

    /**
     * @event validated
     * Fired when captcha answer is validated
     * @param {Ext.captcha.Captcha} this
     * @param {Boolean} isValid Whether the answer is correct
     * @param {String} userAnswer The user's answer
     * @param {String} correctAnswer The correct answer
     */

    /**
     * @event validationerror
     * Fired when validation fails (blank field or incorrect answer)
     * @param {Ext.captcha.Captcha} this
     * @param {String} errorType Type of error ('blank' or 'incorrect')
     * @param {String} errorMessage The error message
     */

    layout: {
        type: 'vbox',
        // align: 'stretch'
    },

    cls: Ext.baseCSSPrefix + 'captcha',

    // Component state
    currentChallenge: null,
    currentAnswer: null,

    // Built-in utility configs
    alphanumericChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    excludeChars: ['0', 'O', '1', 'I', 'l'],
    mathOperators: ['+', '-', '*'],
    colors: ['#2c3e50', '#34495e', '#7f8c8d', '#3498db', '#27ae60', '#e67e22', '#8e44ad'],

    initComponent: function () {
        var me = this;

        // Validate configuration
        me.validateConfig();

        // Initialize state
        me.resetState();

        // Build component items
        me.items = me.buildItems();

        me.callParent();

        // Generate initial challenge after render
        me.on('afterrender', me.generateChallenge, me, { single: true });
    },

    /**
     * Validate component configuration
     * @private
     */
    validateConfig: function () {
        var me = this;

        if (!Ext.Array.contains(['alphanumeric', 'math'], me.type)) {
            Ext.log.warn('Invalid captcha type: ' + me.type + '. Using alphanumeric.');
            me.type = 'alphanumeric';
        }

        me.length = Math.max(1, Math.min(10, me.length || 6));
        me.distortionLevel = Math.max(1, Math.min(10, me.distortionLevel || 5));
        me.noiseLevel = Math.max(1, Math.min(10, me.noiseLevel || 3));
        me.canvasWidth = Math.max(200, me.canvasWidth || 300);
        me.canvasHeight = Math.max(60, me.canvasHeight || 80);
    },

    /**
     * Reset component state
     * @private
     */
    resetState: function () {
        var me = this;

        me.currentChallenge = null;
        me.currentAnswer = null;
    },

    /**
     * Build component items
     * @private
     */
    buildItems: function () {
        var me = this,
            items = [];

        // Canvas container
        items.push(me.buildCanvasContainer());

        // Input ,refresh and audio container
        items.push(me.buildInputContainer());

        return {
            xtype: 'container',
            items: items,
            padding: 10,
            style: {
                border: '1px solid #d0d0d0',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
            },
        };

    },

    /**
     * Build canvas container
     * @private
     */
    buildCanvasContainer: function () {
        var me = this;

        return {
            xtype: 'container',
            itemId: 'canvasContainer',
            height: me.canvasHeight + 2,
            style: {
                border: '1px solid #d0d0d0',
                backgroundColor: '#ffffff',
                borderRadius: '4px'
            },
            html: Ext.String.format('<canvas id="{0}" width="{1}" height="{2}" style="display:block;"></canvas>',
                me.getCanvasId(), me.canvasWidth, me.canvasHeight),
            margin: '0 0 10 0'
        };
    },

    /**
     * Build input container
     * @private
     */
    buildInputContainer: function () {
        var me = this;
        var items = [];

        // Answer input field
        items.push({
            xtype: 'textfield',
            itemId: 'answerField',
            width: me.canvasWidth - 90, // Adjust width to fit canvas
            allowBlank: me.allowBlank,
            blankText: me.blankText,
            enableKeyEvents: true,
            listeners: {
                keypress: me.onAnswerKeyPress,
                scope: me
            }
        }, {
            xtype: 'button',
            itemId: 'resetBtn',
            iconCls: 'x-fa fa-sync',
            tooltip: 'Reset Captcha',
            margin: '0 0 0 10',
            width: 35,
            handler: me.generateChallenge,
            scope: me
        });

        // Audio button (if enabled)
        if (me.enableAudio) {
            items.push({
                xtype: 'button',
                itemId: 'audioBtn',
                iconCls: 'fa fa-volume-up',
                tooltip: 'Play Audio',
                margin: '0 0 0 10',
                width: 35,
                handler: me.playAudio,
                scope: me
            });
        }

        return {
            xtype: 'container',
            layout: 'hbox',
            items: items
        };
    },

    /**
     * Generate unique canvas ID
     * @private
     */
    getCanvasId: function () {
        return 'captcha-canvas-' + this.getId();
    },

    /**
     * Generate alphanumeric challenge
     * @private
     */
    generateAlphanumeric: function (options) {
        var me = this;
        options = options || {};
        var length = options.length || me.length;
        var chars = me.alphanumericChars;
        var excludeChars = options.excludeChars || me.excludeChars;

        // Filter out confusing characters
        var filteredChars = chars.split('').filter(function (char) {
            return excludeChars.indexOf(char) === -1;
        }).join('');

        var challenge = '';
        for (var i = 0; i < length; i++) {
            challenge += filteredChars.charAt(Math.floor(Math.random() * filteredChars.length));
        }

        return {
            challenge: challenge,
            answer: challenge,
            type: 'alphanumeric'
        };
    },

    /**
     * Generate math challenge
     * @private
     */
    generateMath: function (options) {
        var me = this;
        options = options || {};
        var difficulty = options.difficulty || me.distortionLevel;
        var maxNumber = Math.min(20, difficulty * 4);

        var num1 = Math.floor(Math.random() * maxNumber) + 1;
        var num2 = Math.floor(Math.random() * maxNumber) + 1;
        var operators = me.mathOperators;
        var operator = operators[Math.floor(Math.random() * operators.length)];
        var answer;

        switch (operator) {
            case '+':
                answer = num1 + num2;
                break;
            case '-':
                if (num1 < num2) {
                    var temp = num1;
                    num1 = num2;
                    num2 = temp;
                }
                answer = num1 - num2;
                break;
            case '*':
                num1 = Math.floor(Math.random() * Math.min(10, difficulty)) + 1;
                num2 = Math.floor(Math.random() * Math.min(10, difficulty)) + 1;
                answer = num1 * num2;
                break;
        }

        return {
            challenge: num1 + ' ' + operator + ' ' + num2 + ' = ?',
            answer: answer.toString(),
            type: 'math'
        };
    },

    /**
     * Render captcha on canvas
     * @private
     */
    renderCanvas: function (canvas, challenge, config) {
        var me = this,
            ctx;

        if (!canvas || !canvas.getContext) {
            return false;
        }

        config = Ext.apply({
            distortionLevel: me.distortionLevel,
            noiseLevel: me.noiseLevel,
            fontSize: 24,
            fontFamily: 'Arial, sans-serif',
            width: canvas.width || me.canvasWidth,
            height: canvas.height || me.canvasHeight
        }, config);

        ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, config.width, config.height);

        // Render layers
        me.drawBackground(ctx, config);
        me.addNoise(ctx, config, 0.1);
        me.drawText(ctx, challenge, config);
        me.addNoise(ctx, config, 0.05);

        return true;
    },

    /**
     * Draw background gradient
     * @private
     */
    drawBackground: function (ctx, config) {
        var gradient = ctx.createLinearGradient(0, 0, config.width, config.height);
        gradient.addColorStop(0, '#f9f9f9');
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, '#e9e9e9');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, config.width, config.height);
    },

    /**
     * Add noise to canvas
     * @private
     */
    addNoise: function (ctx, config, opacity) {
        var me = this,
            noiseLevel = config.noiseLevel || me.noiseLevel;

        ctx.save();
        ctx.globalAlpha = opacity || 0.1;

        // Random dots
        for (var i = 0; i < noiseLevel * 20; i++) {
            ctx.fillStyle = me.getRandomColor();
            ctx.beginPath();
            ctx.arc(
                Math.random() * config.width,
                Math.random() * config.height,
                Math.random() * 2 + 1,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }

        // Random lines
        for (var j = 0; j < Math.ceil(noiseLevel / 2); j++) {
            ctx.strokeStyle = me.getRandomColor();
            ctx.lineWidth = Math.random() * 2 + 1;
            ctx.beginPath();
            ctx.moveTo(Math.random() * config.width, Math.random() * config.height);
            ctx.quadraticCurveTo(
                Math.random() * config.width,
                Math.random() * config.height,
                Math.random() * config.width,
                Math.random() * config.height
            );
            ctx.stroke();
        }

        ctx.restore();
    },

    /**
     * Draw distorted text
     * @private
     */
    drawText: function (ctx, text, config) {
        var me = this,
            distortionLevel = config.distortionLevel || me.distortionLevel,
            fontSize = config.fontSize || 24,
            fontFamily = config.fontFamily || 'Arial',
            centerX, centerY, charSpacing, char, charX, charY;

        ctx.save();
        ctx.font = fontSize + 'px ' + fontFamily;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        centerX = config.width / 2;
        centerY = config.height / 2;
        charSpacing = Math.min(fontSize * 0.8, (config.width - 40) / text.length);

        // Draw each character with distortion
        for (var i = 0; i < text.length; i++) {
            char = text.charAt(i);
            charX = centerX + (i - text.length / 2) * charSpacing;
            charY = centerY + (Math.random() - 0.5) * (distortionLevel * 2);

            ctx.save();

            // Character transformations
            ctx.translate(charX, charY);
            ctx.rotate((Math.random() - 0.5) * (distortionLevel / 30));
            ctx.scale(
                1 + (Math.random() - 0.5) * (distortionLevel / 50),
                1 + (Math.random() - 0.5) * (distortionLevel / 50)
            );

            // Shadow effect
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillText(char, 1, 1);

            // Main character
            ctx.fillStyle = me.getRandomColor();
            ctx.fillText(char, 0, 0);

            ctx.restore();
        }

        ctx.restore();
    },

    /**
     * Get random color
     * @private
     */
    getRandomColor: function () {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    },

    /**
     * Generate new captcha challenge
     */
    generateChallenge: function () {
        var me = this,
            challengeData;

        me.resetState();
        me.clearAnswerField();

        challengeData;

        if (me.type === 'math') {
            challengeData = me.generateMath({
                difficulty: me.distortionLevel
            });
        } else {
            challengeData = me.generateAlphanumeric({
                length: me.length,
                excludeChars: me.excludeChars
            });
        }

        me.currentChallenge = challengeData.challenge;
        me.currentAnswer = challengeData.answer;

        // Render on canvas
        me.renderChallenge();

        // Fire event
        me.fireEvent('challengegenerated', me, me.currentChallenge, me.type);

        return me.currentChallenge;
    },

    /**
     * Render challenge on canvas
     * @private
     */
    renderChallenge: function () {
        var me = this,
            canvas;

        if (!me.currentChallenge) return;

        canvas = document.getElementById(me.getCanvasId());
        if (!canvas) {
            // Canvas not ready, try again
            Ext.defer(me.renderChallenge, 100, me);
            return;
        }

        me.renderCanvas(canvas, me.currentChallenge, {
            distortionLevel: me.distortionLevel,
            noiseLevel: me.noiseLevel,
            width: me.canvasWidth,
            height: me.canvasHeight
        });
    },

    /**
     * Validate user answer against current challenge
     * @param {String} userAnswer Optional user answer. If not provided, takes from input field
     * @return {Boolean} True if answer is correct
     */
    validate: function (userAnswer) {
        var me = this,
            answerField = me.down('#answerField'),
            isValid;

        if (!me.currentAnswer) {
            return false;
        }

        // Get answer from parameter or input field
        if (typeof userAnswer === 'undefined') {
            userAnswer = answerField ? (answerField.getValue() || '').trim() : '';
        }

        userAnswer = (userAnswer || '').trim();

        // Check for blank field if allowBlank is false
        if (!me.allowBlank && !userAnswer) {
            // Trigger field validation to show error
            if (answerField) {
                answerField.validate();
            }

            // Fire validation error event
            me.fireEvent('validationerror', me, 'blank', me.blankText);

            return false;
        }

        // If allowBlank is true and field is empty, consider it valid
        if (me.allowBlank && !userAnswer) {
            // Clear any existing field errors
            if (answerField) {
                answerField.clearInvalid();
            }

            // Fire validation event
            me.fireEvent('validated', me, true, userAnswer, me.currentAnswer);

            return true;
        }

        // Validate the actual answer
        isValid = me.caseSensitive ?
            userAnswer === me.currentAnswer :
            userAnswer.toUpperCase() === me.currentAnswer.toUpperCase();

        // Handle field validation state
        if (answerField) {
            if (isValid) {
                answerField.clearInvalid();
            } else {
                answerField.markInvalid('Incorrect captcha answer');
            }
        }

        // Fire appropriate events
        if (isValid) {
            me.fireEvent('validated', me, isValid, userAnswer, me.currentAnswer);
        } else {
            me.fireEvent('validationerror', me, 'incorrect', 'Incorrect captcha answer');
            me.fireEvent('validated', me, isValid, userAnswer, me.currentAnswer);
        }

        return isValid;
    },

    /**
     * Check if the captcha field is valid (runs field validation)
     * @return {Boolean} True if field passes validation
     */
    isValid: function () {
        var answerField = this.down('#answerField');

        return answerField ? answerField.isValid() : true;
    },

    /**
     * Clear validation errors on the answer field
     */
    clearInvalid: function () {
        var answerField = this.down('#answerField');

        if (answerField) {
            answerField.clearInvalid();
        }
    },

    /**
     * Mark the answer field as invalid with a custom message
     * @param {String} msg The error message
     */
    markInvalid: function (msg) {
        var answerField = this.down('#answerField');

        if (answerField) {
            answerField.markInvalid(msg);
        }
    },

    /**
     * Clear answer field
     * @private
     */
    clearAnswerField: function () {
        var answerField = this.down('#answerField');

        if (answerField) {
            answerField.setValue('');
            answerField.clearInvalid();
        }
    },

    /**
     * Play audio for accessibility
     */
    playAudio: function () {
        var me = this,
            utterance;

        if (!me.currentChallenge || !me.enableAudio) return;

        if ('speechSynthesis' in window) {
            utterance = new SpeechSynthesisUtterance();

            if (me.type === 'math') {
                utterance.text = me.currentChallenge
                    .replace(/\+/g, ' plus ')
                    .replace(/-/g, ' minus ')
                    .replace(/\*/g, ' times ')
                    .replace(/=/g, ' equals ')
                    .replace(/\?/g, ' what');
            } else {
                utterance.text = me.currentChallenge.split('').join(' ');
            }

            utterance.rate = 0.7;
            utterance.pitch = 1;
            utterance.volume = 1;

            speechSynthesis.speak(utterance);
        } else {
            // TODO: need to throw warning on the console or find a way to support on every browser
            Ext.Msg.alert('Audio Not Available', 'Speech synthesis is not supported in your browser.');
        }
    },

    /**
     * Handle answer field key press
     * @private
     */
    onAnswerKeyPress: function (field, e) {
        if (e.getKey() === e.ENTER) {
            this.fireEvent('enterkeypressed', this, field.getValue());
        }
    },

    /**
     * Get current challenge text
     * @return {String} Current challenge
     */
    getChallenge: function () {
        return this.currentChallenge;
    },

    /**
     * Get current correct answer
     * @return {String} Current answer
     */
    getCorrectAnswer: function () {
        return this.currentAnswer;
    },

    /**
     * Get user's current input
     * @return {String} Current user input
     */
    getUserAnswer: function () {
        var answerField = this.down('#answerField');

        return answerField ? (answerField.getValue() || '').trim() : '';
    },

    /**
     * Set user's answer in the input field
     * @param {String} answer The answer to set
     */
    setUserAnswer: function (answer) {
        var answerField = this.down('#answerField');

        if (answerField) {
            answerField.setValue(answer || '');
        }
    },

    /**
     * Focus the answer input field
     */
    focusInput: function () {
        var answerField = this.down('#answerField');

        if (answerField) {
            answerField.focus();
        }
    },

    /**
     * Check if captcha has a challenge ready
     * @return {Boolean} True if challenge is ready
     */
    hasChallenge: function () {
        return !!this.currentChallenge && !!this.currentAnswer;
    },

    /**
     * Change captcha type and generate new challenge
     * @param {String} type 'alphanumeric' or 'math'
     */
    setType: function (type) {
        if (Ext.Array.contains(['alphanumeric', 'math'], type)) {
            this.type = type;
            this.generateChallenge();
        }
    },

    /**
     * Get current captcha type
     * @return {String} Current type
     */
    getType: function () {
        return this.type;
    },

    /**
     * Set allowBlank configuration
     * @param {Boolean} allowBlank Whether to allow blank answers
     */
    setAllowBlank: function (allowBlank) {
        var me = this,
            answerField = me.down('#answerField');

        me.allowBlank = allowBlank;

        if (answerField) {
            answerField.allowBlank = allowBlank;
        }
    },

    /**
     * Get allowBlank configuration
     * @return {Boolean} Current allowBlank setting
     */
    getAllowBlank: function () {
        return this.allowBlank;
    }
});