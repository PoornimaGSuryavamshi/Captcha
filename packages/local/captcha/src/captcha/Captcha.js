/**
 * ExtJS Captcha Component
 * 
 * A comprehensive captcha component with alphanumeric and math challenges,
 * visual distortion, noise, and audio accessibility features.
 */
Ext.define('Ext.captcha.Captcha', {
    extend: 'Ext.container.Container',
    alias: 'widget.captcha',
    
    requires: [
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'Ext.button.Button',
        // 'Ext.draw.Component'
    ],
    
    config: {
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
         * Whether the captcha is case sensitive
         */
        caseSensitive: false,
        
        /**
         * @cfg {Boolean} enableAudio
         * Enable audio accessibility feature
         */
        enableAudio: true,
        
        /**
         * @cfg {Number} distortionLevel
         * Level of visual distortion (1-10)
         */
        distortionLevel: 5,
        
        /**
         * @cfg {Number} noiseLevel
         * Level of background noise (1-10)
         */
        noiseLevel: 3
    },
    
    /**
     * @event validate
     * Fired when captcha answer is validated
     * @param {Ext.captcha.Captcha} this
     * @param {Boolean} isValid
     * @param {String} userAnswer
     * @param {String} correctAnswer
     */
    
    /**
     * @event refresh
     * Fired when captcha is refreshed
     * @param {Ext.captcha.Captcha} this
     * @param {String} newChallenge
     */
    
    layout: 'vbox',
    title: 'Captcha Verification',
    height: 300,    
    initComponent: function() {
        var me = this;
        
        // Initialize captcha data
        me.currentChallenge = '';
        me.currentAnswer = '';
        
        me.items = [
            {
                xtype: 'container',
                layout: 'hbox',
                margin: '0 0 10 0',
                items: [
                    // {
                    //     xtype: 'combobox',
                    //     fieldLabel: 'Type',
                    //     store: [
                    //         ['alphanumeric', 'Alphanumeric'],
                    //         ['math', 'Math Problem']
                    //     ],
                    //     value: me.getType(),
                    //     queryMode: 'local',
                    //     editable: false,
                    //     listeners: {
                    //         change: function(combo, newValue) {
                    //             me.setType(newValue);
                    //             me.generateChallenge();
                    //         }
                    //     }
                    // },
                    {
                        xtype: 'button',
                        text: '🔊',
                        tooltip: 'Play Audio',
                        margin: '0 0 0 10',
                        hidden: !me.getEnableAudio(),
                        handler: function() {
                            me.playAudio();
                        }
                    }
                ]
            },
            {
                xtype: 'container',
                itemId: 'captchaCanvas',
                height: 80,
                width: '100%',
                style: {
                    border: '1px solid #ccc',
                    backgroundColor: '#f9f9f9'
                },
                html: '<canvas id="captcha-canvas" width="300" height="80"></canvas>'
            },
            {
                xtype: 'container',
                layout: 'hbox',
                margin: '10 0 0 0',
                items: [
                    {
                        xtype: 'textfield',
                        itemId: 'answerField',
                        fieldLabel: 'Enter Answer',
                        flex: 1,
                        listeners: {
                            specialkey: function(field, e) {
                                if (e.getKey() === e.ENTER) {
                                    me.validateAnswer();
                                }
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        text: 'Refresh',
                        margin: '0 0 0 10',
                        handler: function() {
                            me.generateChallenge();
                        }
                    },
                    {
                        xtype: 'button',
                        text: 'Validate',
                        margin: '0 0 0 5',
                        handler: function() {
                            me.validateAnswer();
                        }
                    }
                ]
            },
            {
                xtype: 'container',
                itemId: 'resultContainer',
                height: 100,
                width: '100%',
                // margin: '10 0 0 0',
                style: {
                    border: '1px solid #ccc',
                    minHeight: '30px',
                    // padding: '5px'
                },
                html: '',
               
            }
        ];
        
        me.callParent();
        
        // Generate initial challenge after render
        me.on('afterrender', function() {
            me.generateChallenge();
        });
    },
    
    /**
     * Generate a new captcha challenge
     */
    generateChallenge: function() {
        var me = this;
        
        if (me.getType() === 'math') {
            me.generateMathChallenge();
        } else {
            me.generateAlphanumericChallenge();
        }
        
        me.drawCaptcha();
        me.clearResult();
        me.down('#answerField').setValue('');
        
        me.fireEvent('refresh', me, me.currentChallenge);
    },
    
    /**
     * Generate alphanumeric challenge
     */
    generateAlphanumericChallenge: function() {
        var me = this,
            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            challenge = '';
        
        for (var i = 0; i < me.getLength(); i++) {
            challenge += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        me.currentChallenge = challenge;
        me.currentAnswer = me.getCaseSensitive() ? challenge : challenge.toUpperCase();
    },
    
    /**
     * Generate math challenge
     */
    generateMathChallenge: function() {
        var me = this,
            num1 = Math.floor(Math.random() * 20) + 1,
            num2 = Math.floor(Math.random() * 20) + 1,
            operators = ['+', '-', '*'],
            operator = operators[Math.floor(Math.random() * operators.length)],
            answer;
        
        switch (operator) {
            case '+':
                answer = num1 + num2;
                break;
            case '-':
                // Ensure positive result
                if (num1 < num2) {
                    var temp = num1;
                    num1 = num2;
                    num2 = temp;
                }
                answer = num1 - num2;
                break;
            case '*':
                // Use smaller numbers for multiplication
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                answer = num1 * num2;
                break;
        }
        
        me.currentChallenge = num1 + ' ' + operator + ' ' + num2 + ' = ?';
        me.currentAnswer = answer.toString();
    },
    
    /**
     * Draw captcha on canvas with distortion and noise
     */
    drawCaptcha: function() {
        var me = this,
            canvas = document.getElementById('captcha-canvas'),
            ctx;
        
        if (!canvas) {
            // Canvas not ready yet, try again after a short delay
            Ext.defer(function() {
                me.drawCaptcha();
            }, 100);
            return;
        }
        
        ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Add background noise
        me.addNoise(ctx, canvas);
        
        // Draw challenge text with distortion
        me.drawDistortedText(ctx, canvas);
        
        // Add more noise on top
        me.addNoise(ctx, canvas, 0.3);
    },
    
    /**
     * Add noise to canvas
     */
    addNoise: function(ctx, canvas, opacity) {
        var me = this;
        opacity = opacity || 0.1;
        var noiseLevel = me.getNoiseLevel();
        
        ctx.globalAlpha = opacity;
        
        for (var i = 0; i < noiseLevel * 50; i++) {
            ctx.fillStyle = me.getRandomColor();
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 3 + 1,
                Math.random() * 3 + 1
            );
        }
        
        // Draw random lines
        for (var j = 0; j < noiseLevel; j++) {
            ctx.strokeStyle = me.getRandomColor();
            ctx.lineWidth = Math.random() * 2 + 1;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    },
    
    /**
     * Draw distorted text
     */
    drawDistortedText: function(ctx, canvas) {
        var me = this,
            text = me.currentChallenge,
            distortionLevel = me.getDistortionLevel();
        
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        var x = canvas.width / 2;
        var y = canvas.height / 2;
        
        // Apply random transformations
        ctx.save();
        
        // Random rotation
        var rotation = (Math.random() - 0.5) * (distortionLevel / 50);
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        // Random skew
        var skewX = (Math.random() - 0.5) * (distortionLevel / 100);
        var skewY = (Math.random() - 0.5) * (distortionLevel / 100);
        ctx.transform(1, skewY, skewX, 1, 0, 0);
        
        // Draw text with random colors
        for (var i = 0; i < text.length; i++) {
            var char = text.charAt(i);
            var charX = (i - text.length / 2) * 20;
            var charY = (Math.random() - 0.5) * (distortionLevel * 2);
            
            ctx.fillStyle = me.getRandomColor();
            ctx.fillText(char, charX, charY);
        }
        
        ctx.restore();
    },
    
    /**
     * Get random color
     */
    getRandomColor: function() {
        var colors = ['#333', '#666', '#999', '#007bff', '#28a745', '#dc3545', '#ffc107'];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    /**
     * Validate user answer
     */
    validateAnswer: function() {
        var me = this,
            userAnswer = me.down('#answerField').getValue(),
            isValid = false;
        
        if (!userAnswer || userAnswer.trim() === '') {
            me.showResult(false, 'Please enter an answer');
            return;
        }
        
        if (me.getCaseSensitive()) {
            isValid = userAnswer === me.currentAnswer;
        } else {
            isValid = userAnswer.toUpperCase() === me.currentAnswer.toUpperCase();
        }
        
        me.showResult(isValid);
        me.fireEvent('validate', me, isValid, userAnswer, me.currentAnswer);
        
        if (isValid) {
            // Auto-generate new challenge after successful validation
            Ext.defer(function() {
                me.generateChallenge();
            }, 2000);
        }
    },
    
    /**
     * Show validation result
     */
    showResult: function(isValid, customMessage) {
        var me = this,
            container = me.down('#resultContainer'),
            message;
        
        if (customMessage) {
            message = '<div style="color: orange; font-weight: bold; font-size: 14px;">⚠ ' + customMessage + '</div>';
        } else if (isValid) {
            message = '<div style="color: green; font-weight: bold; font-size: 14px; background: #d4edda; padding: 8px; border-radius: 4px; border: 1px solid #c3e6cb;">✓ Correct! Captcha verified successfully.</div>';
        } else {
            message = '<div style="color: red; font-weight: bold; font-size: 14px; background: #f8d7da; padding: 8px; border-radius: 4px; border: 1px solid #f5c6cb;">✗ Incorrect answer. Please try again.</div>';
        }
        
        if (container) {
            container.setHtml(message);
            
            // Add a slight animation effect
            container.getEl().fadeIn({
                duration: 300
            });
        }
    },
    
    /**
     * Clear result message
     */
    clearResult: function() {
        var me = this,
            container = me.down('#resultContainer');
        
        if (container) {
            container.setHtml('');
        }
    },
    
    /**
     * Play audio for accessibility
     */
    playAudio: function() {
        var me = this;
        
        if ('speechSynthesis' in window) {
            var utterance = new SpeechSynthesisUtterance();
            
            if (me.getType() === 'math') {
                // Convert math symbols to words
                var audioText = me.currentChallenge
                    .replace(/\+/g, ' plus ')
                    .replace(/-/g, ' minus ')
                    .replace(/\*/g, ' times ')
                    .replace(/=/g, ' equals ')
                    .replace(/\?/g, ' what');
                utterance.text = audioText;
            } else {
                // Spell out alphanumeric characters
                utterance.text = me.currentChallenge.split('').join(' ');
            }
            
            utterance.rate = 0.7;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            speechSynthesis.speak(utterance);
        } else {
            Ext.Msg.alert('Audio Not Supported', 'Your browser does not support audio playback.');
        }
    },
    
    /**
     * Get current challenge
     */
    getChallenge: function() {
        return this.currentChallenge;
    },
    
    /**
     * Get current answer
     */
    getAnswer: function() {
        return this.currentAnswer;
    },
    
    /**
     * Check if captcha is valid
     */
    isValid: function() {
        var me = this,
            userAnswer = me.down('#answerField').getValue();
        
        if (me.getCaseSensitive()) {
            return userAnswer === me.currentAnswer;
        } else {
            return userAnswer.toUpperCase() === me.currentAnswer.toUpperCase();
        }
    }
});