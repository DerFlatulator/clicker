'use strict';

import $ from 'jquery';
import classNames from 'classnames';
import React from 'react';
import 'jquery.cookie'; // $.cookie
import querystring from 'querystring';

class GameOfLife extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            cells: [[true,  false],
                    [false, true ]],
            clientCell: false,
            buttonEnabled: true
        };
    }

    componentDidMount() {
        console.log(this.props.cellURL);

        $.ajax({
            url: this.props.cellURL,
            dataType: 'json',
            method: 'GET',
            cache: false,
            success: (data) => {
                console.log(data);
                this.setState({
                    clientCell: data.alive
                });
            },
            error: (xhr, status, err) => {
                console.error(xhr, status, err.toString());
            }
        });
    }

    /**
     * Deserialize a cell representation
     * @param {string} serial
     * @returns {Array} 2D array of {Boolean} cells
     */
    static deserialize(serial) {
        var rows = serial.split('\n');

        return rows.map(row => {
            return row.split('').map(s => s !== "0");
        });
    }

    isAlive() {
        return this.state.clientCell;

        // TODO validation
        // var index = this.props.cellName.match(/[0-9]/).index,
        //    columnLetter = this.props.cellName.substring(0, index),
        //    row = parseInt(this.props.cellName.substring(index)) - 1,
        //    column = columnLetter.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
        //
        // return this.state.cells[row][column];
    }

    swap() {
        this.setState({ buttonEnabled: false });
        $.ajax({
            url: this.props.cellURL,
            method: 'PATCH',
            data: {
                alive: !this.isAlive()
            },
            dataType: 'json',
            success: this.swapDone.bind(this),
            error: (xhr, status, err) => {
                console.error(this.props.cellURL, status, err.toString());
            }
        });
    }

    swapDone({ alive }) {
        this.setState({
            buttonEnabled: true,
            clientCell: alive
        });
    }

    render() {
        var classes = classNames({
            'disabled': !this.state.buttonEnabled,
            'green darken-2': !this.isAlive(),
            'red darken-2': this.isAlive()
        }, [
            'swapButton', 'waves-effect', 'waves-light', 'btn-large'
        ]);

        return (
            <div className="sortPanel">
                <h5>You are responsible for <strong>cell {this.props.cellName}</strong>.</h5>

                <a onClick={this.swap.bind(this)} className={classes}>
                    <i className="mdi-action-invert-colors left"></i>
                    { this.isAlive() ? 'Die' : 'Live' }
                </a>

                {this.isAlive() ? (
                    <h5>Click <span className="red-text">DIE</span> when the number of
                        <span className="green-text"> alive </span>
                        <a href="#neighbours" className="modal-trigger tooltip"
                           data-tooltip="Click for info"> neighbours</a>
                        &nbsp;is <strong> more than 3 </strong>
                        or <strong> less than 2</strong>.</h5>
                ) : (
                    <h5>Click <span className="green-text">LIVE</span> when the number of
                        <span className="green-text"> alive </span>
                        <a href="#neighbours" className="modal-trigger tooltip"
                           data-tooltip="Click for info"> neighbours</a>
                           &nbsp;is <strong> exactly 3</strong>.</h5>
                )}

                <div id="neighbours" className="modal modal-fixed-footer textLeft">
                    <div className="modal-content">
                        <h4>Neighbours</h4>
                        <p>A neighbour is any cell that is next to your cell. This includes diagonals.</p>
                        <ul className="collection">
                            <li className="collection-item">Cells in corners have three neighbours.</li>
                            <li className="collection-item">Cells on an edge have five neighbours.</li>
                            <li className="collection-item">All other cells have a total of eight neighbours.</li>
                        </ul>

                        <div className="row">
                            <div className="col s12 m7">
                                <div className="card">
                                    <div className="card-image">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Moore_neighborhood_with_cardinal_directions.svg/300px-Moore_neighborhood_with_cardinal_directions.svg.png"></img>
                                    </div>
                                    <div className="card-content">
                                        &quot;<a href="https://commons.wikimedia.org/wiki/File:Moore_neighborhood_with_cardinal_directions.svg#/media/File:Moore_neighborhood_with_cardinal_directions.svg">Moore neighborhood with cardinal directions</a>&quot; by <a href="//commons.wikimedia.org/wiki/User:MorningLemon" title="User:MorningLemon">MorningLemon</a> - <span>Own work</span>. Licensed under <a href="http://creativecommons.org/licenses/by-sa/4.0" title="Creative Commons Attribution-Share Alike 4.0">CC BY-SA 4.0</a> via <a href="https://commons.wikimedia.org/wiki/">Wikimedia Commons</a>.
                                    </div>
                                    <div className="card-action">
                                        <a href="https://en.wikipedia.org/wiki/Moore_neighborhood">Read more on Wikipedia</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Got it!</a>
                    </div>
                </div>
            </div>
        );
    }
}

class BaseComponent extends React.Component {
    _bind(...methods) {
        methods.forEach(method => this[method] = this[method].bind(this));
    }
}

class App extends BaseComponent {
    constructor(props) {
        super (props);
        this._bind('register', 'connect', 'onRegistered', 'getDeviceID',
            'isRegisteredToClass', 'componentDidMount', 'ignoreMessage');
        this.state = {
            device_id: this.getDeviceID(),
            connect_state: 'disconnected',
            socketConnected: false
        };

        console.log('App#constructor');
    }

    ignoreMessage(message) {
        if (!('localStorage' in window))
            return false;
        var ctr = window.localStorage.getItem('socket.io:gameoflife.client-counter');
        if (ctr && parseInt(ctr) >= message._counter) {
            return true;
        } else {
            window.localStorage.setItem('socket.io:gameoflife.client-counter', message._counter);
            return false;
        }
    }

    componentDidMount() {
        console.log('App#didMount');

        this.setState({
            connected: this.isRegisteredToClass(this.props.clickerClass)
        });

        $.getJSON(`/api/interaction/?state=active&class=${this.props.clickerClass}`,
                data => {
                if (data.count > 0) {
                    this.setCurrentInteraction(data.results[0]);
                }
            }
        );

        console.log('creating socket');
        var socket = io(this.props.channel, {
            'multiplex': false,
            'sync disconnect on unload': true
        });

        this.setState({ socket });

        console.log(socket);

        window.onbeforeunload = () => {
            socket.disconnect();
        };

        socket.on('connect', () => {
            this.setState({ socketConnected: true });
            console.log('socket connected');
            //if ('localStorage' in window) {
            //    window.localStorage.setItem('socket.io:gameoflife.client-counter', '0');
            //}
        });

        // socket.on('disconnect', ...

        socket.on('message', message => {
            console.log(message);

            if (!this.state.socketConnected)
                return;

            //if (this.ignoreMessage(message))
            //    return;

            var data = JSON.parse(message);

            if (data.event_type === 'new_interaction') {
                if (this.state.device_id in data.assignments) {

                    this.setState({
                        interaction_url: `/api/interaction/${data.interaction}/`,
                        assignments: data.assignments,
                        instance_url: `/api/gameoflife/${data.game_of_life}/`,
                        cell_name: data.assignments[this.state.device_id]
                    });
                    this.setState({
                        cell_url: `/api/gameoflifecell/${data.cell_pks[this.state.cell_name]}/`,
                        connect_state: 'connected'
                    });

                    if ('vibrate' in window.navigator && typeof window.navigator.vibrate === 'function') {
                        window.navigator.vibrate([100, 100, 100]);
                    }
                }
            }
        });
    }

    setCurrentInteraction(interaction) {
        let data = JSON.parse(interaction.data_json);

        this.setState({
            interaction_url: interaction.url,
            assignments: data.assignments,
            instance_url: interaction.gameoflife.url,
            connect_state: 'connected'
        });
    }

    componentDidUpdate() {
        $('.modal-trigger').leanModal();
        $('.tooltip').tooltip({delay: 50});
    }

    /**
     * :return: the device_id or null
     */
    getDeviceID() {
        if ('localStorage' in window) {
            var device_id = window.localStorage.getItem('device_id');
            if (device_id != null)
                return device_id;
        }
        return null;
    }

    isRegisteredToClass(clickerClass) {
        if ('localStorage' in window) {
            return window.localStorage.getItem(`registered:${clickerClass}`) === "true";
        }
        return false;
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
        console.log(data);
        this.setState({
            device_id: data.device_id,
            connect_state: 'registering'
        });
        if ('localStorage' in window)
            window.localStorage.setItem('device_id', data.device_id);

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
        if ('localStorage' in window) {
            window.localStorage.setItem(`registered:${this.props.clickerClass}`, "true");
        }
    }

    render() {
        if (this.state.connected) {
            if (this.state.connect_state === 'connected') {
                //return <i/>;
                return (
                    <GameOfLife {...this.props}
                        socket={this.state.socket}
                        cellName={this.state.cell_name}
                        cellURL={this.state.cell_url}
                        />
                );
            } else {
                return (
                    <div className={'card-panel'}>
                        <p className={'flow-text'}>Waiting for interactions to open</p>
                        <div className="progress">
                            <div className="indeterminate"></div>
                        </div>

                    </div>
                );
            }


            //<div className="preloader-wrapper active">
            //    <div className="spinner-layer spinner-blue-only">
            //        <div className="circle-clipper left">
            //            <div className="circle"></div>
            //        </div><div className="gap-patch">
            //        <div className="circle"></div>
            //    </div><div className="circle-clipper right">
            //        <div className="circle"></div>
            //    </div>
            //    </div>
            //</div>


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
        channel = socketBase + "gameoflife.client";

    $.getScript(socketURL, function () {
        $(() => {
            React.render(
                <App channel={channel}
                     clickerClass={'gameoflife'}
                     date={new Date()}/>,
                document.getElementById('react-main')
            );
        });
    });
};
run();