"use strict";

import $ from 'jquery';
import classNames from 'classnames';
import React from 'react';
import 'jquery.cookie'; // $.cookie
import querystring from 'querystring';

class BaseComponent extends React.Component {
    _bind(...methods) {
        methods.forEach(method => this[method] = this[method].bind(this));
    }
}

class Storage {
    static _handleError (ex) {
        if (ex instanceof DOMException) {
            if ('__proto__' in ex && SECURITY_ERR in ex.__proto__) {
                if (ex.code === ex.__proto__.SECURITY_ERR) {
                    alert("Your browser doesn't support cookies.\n" +
                          "Enable cookies from your device settings, and " +
                          "ensure you aren't in Private browsing");

                    return;
                }
            }
            alert('An error occurred when trying to store data on your device:\n' +
                  ex.message);
        }
    }
    static getItem(key) {
        if (window.hasOwnProperty('localStorage')) {
            try {
                return window.localStorage.getItem(key);
            } catch (ex) {
                Storage._handleError(ex);
            }
        }
        return null;
    }
    static setItem(key, value) {
        if (window.hasOwnProperty('localStorage')) {
            try {
                window.localStorage.setItem(key, value);
                return true;
            } catch (ex) {
                Storage._handleError(ex);
            }
        }
        return false;
    }
}


class Interaction extends BaseComponent {
    constructor(props) {
        super (props);
        this._bind('register', 'connect', 'onRegistered', 'getDeviceID',
            'isRegisteredToClass', 'componentDidMount', 'ignoreMessage',
            'ensureRegisteredToClass');
        this.state = {
            device_id: this.getDeviceID(),
            connect_state: 'disconnected',
            socketConnected: false,
            //interaction_url: null,
            assignments: [],
            //instance_url: null,
            instance_script_path: null,
            instance_loaded: false,
            instance_component_name: null
        };

        console.log('App#constructor');
    }

    ignoreMessage(message) {
        var ctr = Storage.getItem('socket.io:gameoflife.client-counter');
        if (ctr && parseInt(ctr) >= message._counter) {
            return true;
        } else {
            Storage.setItem('socket.io:gameoflife.client-counter', message._counter);
            return false;
        }
    }

    componentDidMount() {
        //console.log('App#didMount');

        if (this.isRegisteredToClass(this.props.clickerClass)) {
            this.ensureRegisteredToClass(this.props.clickerClass);
        }


        //console.log(`/api/interaction/?state=active&class=${this.props.clickerClass}`);

        $.getJSON(`/api/interaction/?state=active&class=${this.props.clickerClass}`,
            data => {
                if (data.count > 0) {
                    this.setCurrentInteraction(data.results[0]);
                }
            }
        );

        //console.log('creating socket');
        var socket = io(this.props.channel, {
            'multiplex': false,
            'sync disconnect on unload': true
        });

        this.setState({ socket });

        //console.log(socket);

        window.onbeforeunload = () => {
            socket.disconnect();
        };

        socket.on('connect', () => {
            this.setState({ socketConnected: true });
            //console.log('socket connected');
            //if ('localStorage' in window) {
            //    window.localStorage.setItem('socket.io:gameoflife.client-counter', '0');
            //}
        });

        // socket.on('disconnect', ...

        socket.on('message', message => {
            //console.log(message);

            if (!this.state.socketConnected)
                return;

            //if (this.ignoreMessage(message))
            //    return;

            var data = JSON.parse(message);

            if (data.event_type === 'new_interaction') {
                if (this.state.device_id in data.assignments) {

                    this.setCurrentInteraction({data_json: message});
                }
            }
        });
    }

    setCurrentInteraction(interaction) {
        let data = JSON.parse(interaction.data_json);
        //console.log(data);

        this.setState({
            //interaction_url: interaction.url,
            assignments: data.assignments,
            urls: data.urls || {},
            instance_url: interaction.instance_url || data.instance_url,
            connect_state: 'connected',
            instance_script_path: data.instance_script.replace(':type:', 'client'),
            instance_component_name: data.instance_component_name,
            instance_loaded: false
        });
        this.getInstance();
    }

    getInstance() {
        this.setState({
            instance_loaded: false
        });
        //console.log(this.state.instance_script_path);

        $.ajax({
            dataType: "script",
            cache: false, // TODO change this to true
            url: this.state.instance_script_path,
            error: console.error.bind(console)
        }).done(this.onGotInstance.bind(this, this.state.instance_component_name));
    }

    onGotInstance(component_name) {
        this.setState({
            instance_loaded: true,
            instance_component_name: component_name
        });

        if ('vibrate' in window.navigator && typeof window.navigator.vibrate === 'function') {
            window.navigator.vibrate([150, 100, 150]);
        }
    }

    componentDidUpdate() {
        $('.modal-trigger').leanModal();
        $('.tooltip').tooltip({delay: 50});
    }

    /**
     * :return: the device_id or null
     */
    getDeviceID() {
        var device_id = Storage.getItem('device_id');
        if (device_id != null)
            return device_id;

        return null;
    }

    isRegisteredToClass(clickerClass) {
        return Storage.getItem(`registered:${clickerClass}`) === "true";
    }

    ensureRegisteredToClass(clickerClass) {
        console.log('validating cache');

        $.get(`/api/connect/${this.getDeviceID()}`, ({ classes }) => {
            var filtered = classes.filter((item) => item.class_name === clickerClass);

            if (filtered.length > 0) {
                // Storage is valid
                Storage.setItem(`registered:${clickerClass}`, 'true');
                this.setState({ connected: true });
            } else {
                // Invalidate storage
                Storage.setItem(`registered:${clickerClass}`, 'false');
                this.setState({ connected: false });
            }
        });
    }

    connect() {
        this.setState({ connect_state: 'connecting' });
        console.log('connecting');

        var device_id = this.getDeviceID();
        if (device_id) {
            this.setState({ device_id });
            console.log('registering (already had device_id)');

            this.register({ device_id, classes: [] }).then(this.onRegistered);
        } else {
            $.post('/api/connect/', (data) => {
                console.log('registering (retrieved device_id)');
                this.register(data).then(this.onRegistered);
            }).fail(console.error.bind(console));
        }
    }

    register(data) {
        //console.log(data);
        this.setState({
            device_id: data.device_id,
            connect_state: 'registering'
        });
        Storage.setItem('device_id', data.device_id);

        var isRegistered = data.classes.map(url => url.split("/").pop())
                .indexOf(this.props.clickerClass) > -1;

        return new Promise((resolve, reject) => {
            if (!isRegistered) {
                $.ajax({
                    url: `/api/connect/${data.device_id}/classes/`,
                    method: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        "add": [this.props.clickerClass]
                    }),
                    success: resolve,
                    error: reject
                });
            } else {
                resolve();
            }
        });
    }

    onRegistered() {
        this.setState({
            connected: true,
            connect_state: 'registered'
        });
        Storage.setItem(`registered:${this.props.clickerClass}`, "true");
    }

    render() {
        if (this.state.connected) {
            if (this.state.connect_state === 'connected' && this.state.instance_loaded) {
                //return <i/>;
                let DynamicInteraction = window.interactions[this.state.instance_component_name];
                console.log(this.state.instance_component_name, DynamicInteraction);
                //console.log(this.state.cell_url, this.state);
                return (
                    <DynamicInteraction {...this.props}
                        socket={this.state.socket}
                        url={this.state.instance_url}
                        deviceId={this.state.device_id}
                        assignments={this.state.assignments}
                        urls={this.state.urls}
                        />
                );
            } else {
                return (
                    <div className={'card-panel'}>
                        <h4>Client</h4>
                        <p className={'flow-text'}>Waiting for interactions to open</p>
                        <div className="progress">
                            <div className="indeterminate"></div>
                        </div>

                    </div>
                );
            }
        }
        else {
            var buttonClasses = classNames('waves-effect waves-light btn-large', {
                'disabled': this.state.connect_state === 'connecting'
            });

            return (
                <div className={'card-panel'}>
                    <p className={'flow-text'}>
                        You are not connected to this class.
                    </p>

                    <a onClick={this.connect} className={buttonClasses}>
                        Connect
                    </a>
                </div>
            );
        }
    }
}

let run = function () {
    $.ajaxSetup({
        beforeSend: req => req.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'))
    });

    var qs = querystring.parse(window.location.search.substring(1)),
        socketBase = `//${window.location.hostname}:4000/`,
        socketURL = socketBase + 'socket.io/socket.io.js',
        channel = socketBase + "client";

    $.getScript(socketURL, function () {
        $(() => {
            React.render(
                <Interaction channel={channel}
                             params={qs}
                             clickerClass={$context.class_name}
                             date={new Date()}/>,
                document.getElementById('react-main')
            );
        });
    });
};
run();