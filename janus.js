(function() {
    'use strict';

    var unique_id = Math.floor(Math.random() * (4234455 - 3231212) + 3231212);

    Object.defineProperty(Object.prototype, '_unique_id', {
        writable: true
    });

    Object.defineProperty(Object.prototype, 'unique_id', {
        get: function() {

            if (this._unique_id === undefined) {

                this._unique_id = unique_id;
                unique_id      += 1;
            }

            return this._unique_id;
        },
        set: function() {
            throw new Error('Cannot write read-only attribute unique_id');
        }
    });
}());

/**
 * @name JanusSip
 * @namespace
 */
(function(window) {

    /**
     * Global Namespace for JanusSip
     */
    var JanusSip = (function() {
        'use strict';

        var JanusSip = {};
        Object.defineProperties(JanusSip, {

            name: function() {
                return 'JanusSip';
            },
            version: function() {
                return '0.0.1';
            }
        });

        return JanusSip;
    }());

    /**
     * Constants
     */
    (function(JanusSip) {

        JanusSip.Constants = {

            PLUGIN:           'janus.plugin.sip',
            EVENTS:      [

                'session.success',
                'session.error',
                'session.destroyed',
                'plugin.success',
                'plugin.error',
                'plugin.dialog',
                'plugin.message',
                'plugin.local',
                'plugin.remote',
                'plugin.cleanup',
                'plugin.offer.success',
                'plugin.offer.error',
                'sip.error',
                'sip.registering',
                'sip.registered',
                'sip.calling',
                'sip.incomingcall',
                'sip.accepted',
                'sip.answered',
                'sip.answered.error',
                'sip.hangingup',
                'sip.hangup'
            ]
        };

    }(JanusSip));

    /**
     * Utility methods
     */
    (function(JanusSip) {

        var Util;

        Util = {

            /**
             * This method can be used with two and three params.
             * If three are passed, then inject result into destination.
             * If two are passed, then merge with source.
             *
             * @param destination
             * @param input
             * @param source
             */
            extend: function(destination, input, source) {

                var attr;


                // if arguments has 2 arguments: source is input, input is destination
                // this also means original will be changed
                if (arguments.length === 2) {

                    source      = input;
                    input       = destination;
                    destination = source;
                }

                for (attr in source) {

                    if (source.hasOwnProperty(attr)) {

                        destination[attr] = source[attr];

                        if (input.hasOwnProperty(attr)) {

                            if (typeof input[attr] === 'object') {
                                destination[attr] = JanusSip.Util.extend({}, input[attr], source[attr]);
                            } else {
                                destination[attr] = input[attr];
                            }
                        }
                    }
                }

                return destination;
            }
        };

        JanusSip.Util = Util;

    }(JanusSip));

    /**
     * Original Janus Object
     */
    (function(JanusSip) {

        JanusSip.Janus = Janus;

    }(JanusSip));

    /**
     * Exceptions
     */
    (function(JanusSip) {

        var Exception, Exceptions;

        Exception = (function() {

            var Exception = function(message) {

                this.name    = 'JanusSip.Exception';
                this.code    = 1000;
                this.message = 'Uncaught ' + this.name + ' occurred' + (message !== undefined ? (' with message: ' + message) : '');
            };

            Exception.prototype = new Error();
            return Exception;
        }());

        Exceptions = {

            Exception: Exception,
            NoSessionException: (function(Exception) {

                var NoSessionException = function() {

                    this.name    = 'JanusSip.Exception.NoSessionException';
                    this.code    = 1001;
                    this.message = 'Could not find session';
                };

                NoSessionException.prototype = new Exception();
                return NoSessionException;

            }(Exception)),
            InvalidOptionException: (function(Exception) {

                var InvalidOptionException = function(option) {

                    this.name    = 'JanusSip.Exception.InvalidOptionException';
                    this.code    = 1002;
                    this.option  = option;
                    this.options = options;
                    this.message = 'Invalid option requested (' + option + ')';
                };

                InvalidOptionException.prototype = new Exception();
                return InvalidOptionException;

            }(Exception)),
            NoWebRTCException: (function(Exception) {

                var NoWebRTCException = function() {

                    this.name    = 'JanusSip.Exception.NoWebrtcException';
                    this.code    = 1003;
                    this.message = 'This browser does not have support for WebRTC. Please check the object RTCPeerConnection or getUserMedia';
                };

                NoWebRTCException.prototype = new Exception();
                return NoWebRTCException;

            }(Exception)),
            NoPluginException: (function(Exception) {

                var NoPluginException = function() {

                    this.name    = 'JanusSip.Exception.NoPluginException';
                    this.code    = 1004;
                    this.message = 'Plugin is missing';
                };

                NoPluginException.prototype = new Exception();
                return NoPluginException;

            }(Exception)),
            UnknownEventException: (function(Exception) {

                var UnknownEventException = function(event, events, allowed_events) {

                    this.name           = 'JanusSip.Exception.UnknownEventException';
                    this.code           = 1005;
                    this.event          = event;
                    this.events         = events;
                    this.allowed_events = allowed_events;
                    this.message        = 'Trying to listen to event that does not exist (' + event + ')';
                };

                UnknownEventException.prototype = new Exception();
                return UnknownEventException;
            })(Exception),
            EventNotFoundException: (function(Exception) {

                var EventNotFoundException = function(event, events) {

                    this.name     = 'JanusSip.Exception.EventNotFoundException';
                    this.code     = 1006;
                    this.event    = event;
                    this.events   = events;
                    this.message  = 'Event (' + event + ') was not found';
                };

                EventNotFoundException.prototype = new Exception();
                return EventNotFoundException;

            }(Exception)),
            InvalidRingtoneException: (function(Exception) {

                var InvalidRingtoneException = function(ringtone) {

                    this.name     = 'JanusSip.Exception.InvalidRingtoneException';
                    this.code     = 1007;
                    this.ringtone = ringtone;
                    this.message  = 'Incorrect values for the ringtone';
                };

                InvalidRingtoneException.prototype = new Exception();
                return InvalidRingtoneException;

            }(Exception))
        };

        JanusSip.Exception = Exceptions;

    }(JanusSip));

    /**
     * Default Options
     */
    (function(JanusSip) {

        JanusSip.Options = {

            janus_server: null,
            ringtone:     {

                type:     null,
                source:   null
            },
            media:        {

                audio: {
                    local: true, remote: true
                },
                video: {
                    local: false, remote: false
                }
            },
            sip:          {

                server:   '',
                port:     5060,
                username: '',
                password: ''
            }
        };

    }(JanusSip));

    /**
     * Events
     */
    (function(JanusSip) {

        var Events;

        Events = function() {

            this.events           = {};
            this.available_events = JanusSip.Constants.EVENTS;
        };

        Events.prototype = {

            get: function(event, listener_id) {

                if (this.exists(event) === false) {
                    throw new JanusSip.Exception.UnknownEventException(event, this.events, this.available_events);
                }

                if (this.events[event] !== undefined) {

                    if (listener_id === undefined) {

                        return this.events[event];

                    } else if (this.events[event][listener_id] !== undefined) {

                        return this.events[event][listener_id];
                    }
                }

                return false;
            },
            exists: function(event) {
                return this.available_events.indexOf(event) != -1;
            },
            on: function(event, listener) {

                if (this.get(event) === false) {
                    this.events[event] = {};
                }

                this.events[event][listener.unique_id] = listener;
                return listener.unique_id;
            },
            off: function(event, listener_id) {

                if (this.get(event, listener_id) === false) {
                    throw new JanusSip.Exception.EventNotFoundException(event, this.events);
                }

                delete this.events[event][listener_id];
            },
            apply: function(event, inst, args) {

                if (this.get(event) === false) {
                    return false;
                }

                var listener_id, listener, listeners;

                inst      = inst || null;
                args      = args || [];
                listeners = this.get(event);

                for (listener_id in listeners) {

                    if (listeners.hasOwnProperty(listener_id)) {

                        listener = listeners[listener_id];
                        listener.apply(inst, args);
                    }
                }

                return true;
            }
        };

        JanusSip.Events = new Events();

    }(JanusSip));

    (function(JanusSip) {

        var Message = function(message, jsep) {

            this.message          = message;
            this.jsep             = jsep;
            this.events           = {};
            this.available_events = JanusSip.Constants.EVENTS;

            // parse message
            this.parse();
        };

        Message.prototype = {

            parse: function() {

                var data, event;
                var message = this.message;

                if (message === null || message['sip'] === undefined || message['sip'] !== 'event') {
                    return false;
                }

                data = message['result'];

                switch (data['event']) {

                    case 'registering':
                    case 'registered':
                    case 'calling':
                    case 'accepted':
                    case 'hangingup':
                    case 'hangup':
                    case 'error':
                    case 'incomingcall':

                        event = 'sip.' + data['event'];
                        JanusSip.Events.apply(event, null, [data, this.jsep]);
                        break;
                }

                return message;
            }
        };

        JanusSip.Message = Message;

    }(JanusSip));

    /**
     * Callbacks
     */
    (function(JanusSip) {

        var Session, Plugin;

        Plugin  = {

            success: function(plugin_handler) {
                console.log('Plugin attached: ' + plugin_handler.getPlugin() + '[' + plugin_handler.getId() + ']');
            },
            error: function(error) {
                console.log('Error occurred while attaching plugin: ' + error);
            },
            dialog: function(toggle) {
                console.log('Consent dialog is now ' + (toggle === true ? 'on' : 'off'));
            },
            message: function(message, jsep) {
                console.log('Received message from Janus Server', message);
            },
            local: function(stream) {
                console.log('Received local stream', JSON.stringify(stream));
            },
            remote: function(stream) {
                console.log('Received remote stream', JSON.stringify(stream));
            },
            cleanup: function() {
                console.log('Notification to clean up received from Janus Server');
            }
        };

        Session = {

            success: function(session) {
                console.log('Successfully created session');
            },
            error: function(error) {
                console.log('An error ocurred during the session: ' + error);
            },
            destroyed: function() {
                console.log('Session was destroyed');
            }
        };

        JanusSip.Events.on('plugin.success',    Plugin.success);
        JanusSip.Events.on('plugin.error',      Plugin.error);
        JanusSip.Events.on('plugin.dialog',     Plugin.dialog);
        JanusSip.Events.on('plugin.message',    Plugin.message);
        JanusSip.Events.on('plugin.local',      Plugin.local);
        JanusSip.Events.on('plugin.remote',     Plugin.remote);
        JanusSip.Events.on('plugin.cleanup',    Plugin.cleanup);

        JanusSip.Events.on('session.success',   Session.success);
        JanusSip.Events.on('session.error',     Session.error);
        JanusSip.Events.on('session.destroyed', Session.destroyed);

    }(JanusSip));

    /**
     * User Agent Object
     */
    (function(JanusSip) {

        var UA;

        UA = function(configuration) {

            this.options       = JanusSip.Util.extend({}, configuration, JanusSip.Options);
            this.session       = null;
            this.incoming_jsep = null;
            this.plugin        = null;
            this.events        = JanusSip.Events;
            this.messages      = [];
            var  self          = this;

            JanusSip.Events.on('plugin.message', function(message, jsep) {
                self.messages.push((new JanusSip.Message(message, jsep)));
            });

            JanusSip.Events.on('sip.hangup', function() {

                var plugin = self.getPlugin();
                plugin.hangup();
            });

            JanusSip.Events.on('sip.incomingcall', function(data, jsep) {

                console.log('Incoming call, setting up ringtone if applicable');

                // saving incoming jsep
                self.incoming_jsep = jsep;
            });

            JanusSip.Events.on('sip.hangup', function() {

                // clearing incoming jsep
                self.incoming_jsep = null;
            });
        };

        UA.prototype = {

            getOptions: function() {
                return this.options;
            },
            getOption: function(option) {

                if (this.options[option] === undefined) {
                    throw new JanusSip.Exception.InvalidOptionException(option, this.options);
                }

                return this.options[option];
            },
            getSession: function() {
                return this.session;
            },
            setSession: function(session) {
                this.session = session;
            },
            getPlugin: function() {
                return this.plugin;
            },
            setPlugin: function(plugin) {
                this.plugin = plugin;
            },
            on: function(event, listener) {
                return this.events.on(event, listener);
            },
            off: function(event, listener_id) {
                this.events.off(event, listener_id);
            },
            handleRemoteJsep: function(jsep) {

                if (jsep === undefined || jsep === null) {
                    return false;
                }

                var plugin = this.getPlugin();
                plugin.handleRemoteJsep({

                    jsep:  jsep,
                    error: this.hangup
                });

                return true;
            },
            createSession: function() {

                if (this.getSession() !== null) {
                    return false;
                }

                var server = this.getOption('janus_server'),
                    self   = this;

                JanusSip.Janus.init({debug: false, callback: function() {

                    if (JanusSip.Janus.isWebrtcSupported() === false) {
                        throw new JanusSip.Exception.NoWebRTCException();
                    }

                    var session  = new JanusSip.Janus({

                        server:  server,
                        success: function() {

                            // call all the listeners
                            self.events.apply('session.success', null, [session]);

                            // now attaching our created session to the plugin
                            session.attach({

                                plugin:  JanusSip.Constants.PLUGIN,
                                success: function(plugin) {

                                    // registering plugin
                                    self.setPlugin(plugin);

                                    // plugin success callbacks
                                    self.events.apply('plugin.success', null, [plugin]);
                                },
                                error: function(error) {
                                    self.events.apply('plugin.error', null, [error]);
                                },
                                dialog: function(toggle) {
                                    self.events.apply('plugin.dialog', null, [toggle]);
                                },
                                onmessage: function(message, jsep) {
                                    self.events.apply('plugin.message', null, [message, jsep]);
                                },
                                onlocalstream: function(stream) {
                                    self.events.apply('plugin.local', null, [stream]);
                                },
                                onremotestream: function(stream) {
                                    self.events.apply('plugin.remote', null, [stream]);
                                },
                                oncleanup: function() {
                                    self.events.apply('plugin.cleanup');
                                }
                            });
                        },
                        error: function(error) {
                            self.events.apply('session.error', null, [error]);
                        },
                        destroyed: function() {
                            self.events.apply('session.destroyed', null, []);
                        }
                    });

                    self.setSession(session);
                }});

                return true;
            },
            register: function() {

                // create session
                this.createSession();

                var self    = this;
                this.events.on('plugin.success', function(plugin) {

                    if (self.getSession() === null) {
                        throw new JanusSip.Exception.NoSessionException();
                    }

                    if (self.getPlugin() === null) {
                        throw new JanusSip.Exception.NoPluginException();
                    }

                    var sip_config = self.getOption('sip');
                    plugin.send({

                        message: {

                            request: 'register',
                            proxy:    'sip:' + sip_config['server'] + ':' + sip_config['port'],
                            username: 'sip:' + sip_config['username'] + '@' + sip_config['server'],
                            secret:   sip_config['password']
                        }
                    });
                })
            },
            call: function(number) {

                if (this.getSession() === null) {
                    throw new JanusSip.Exception.NoSessionException();
                }

                if (this.getPlugin() === null) {
                    throw new JanusSip.Exception.NoPluginException();
                }

                var plugin     = this.getPlugin();
                var media      = this.getOption('media');
                var sip_config = this.getOption('sip');

                plugin.createOffer({

                    media: {

                        audioSend: media.audio.local, audioRecv: media.audio.remote,
                        videoSend: media.video.local, videoRecv: media.video.remote
                    },
                    success: function(jsep) {

                        JanusSip.Events.apply('plugin.offer.success', null, [jsep]);
                        plugin.send({

                            message: {

                                request: 'call',
                                uri:     'sip:' + number + '@' + sip_config['server']
                            },
                            jsep: jsep
                        });
                    },
                    error: function(error) {
                        JanusSip.Events.apply('plugin.offer.error', null, [error]);
                    }
                });
            },
            answer: function() {

                if (this.incoming_jsep === null) {
                    return false;
                }

                // answer call
                var plugin = this.getPlugin();
                var media  = this.getOption('media');
                var jsep   = this.incoming_jsep;
                var self   = this;

                plugin.createAnswer({

                    jsep: jsep,
                    media: {

                        audioSend: media.audio.local, audioRecv: media.audio.remote,
                        videoSend: media.video.local, videoRecv: media.video.remote
                    },
                    success: function(jsep) {

                        plugin.send({

                            jsep:    jsep,
                            message: {
                                request: 'accept'
                            }
                        });

                        self.events.apply('sip.answered', null, [{event: 'answered'}, jsep]);
                    },
                    error: function(error) {
                        self.events.apply('sip.answered.error', null, [error]);
                    }
                });

                return true;
            },
            hangup: function() {

                var plugin = this.getPlugin();
                plugin.send({
                    message: {
                        request: 'hangup'
                    }
                });

                plugin.hangup();
            }
        };

        JanusSip.UA = UA;

    }(JanusSip));

    // make it globally available
    window.JanusSip = JanusSip;

}(window));
