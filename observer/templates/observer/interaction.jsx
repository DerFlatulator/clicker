"use strict";

import React from "react";
import $ from "jquery";
import 'jquery.cookie'; // $.cookie
import querystring from 'querystring';

class Interaction extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            interaction_url: null,
            assignments: [],
            instance_url: null,
            instance_script_path: null,
            instance_loaded: false,
            instance_component_name: null
        };
    }

    componentDidMount() {
        var socket = io(this.props.channel);

        this.setState({ socket });

        $.getJSON(`/api/interaction/?state=active&class=${this.props.clickerClass}`,
            data => {
                if (data.count > 0) {
                    this.setCurrentInteraction(data.results[0]);
                }
            }
        );

        socket.on('connect', function () {
            console.log('socket connected');
        });

        socket.on('message', message => {
            //console.log(message);

            let data = JSON.parse(message);
            if (data.event_type === 'new_interaction') {
                this.setCurrentInteraction({data_json: message});
            }
        });
    }

    getInstance() {
        this.setState({
            instance_loaded: false
        });

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
    }

    setCurrentInteraction(interaction) {
        let data = JSON.parse(interaction.data_json);

        this.setState({
            //interaction_url: interaction.url,
            assignments: data.assignments,
            instance_url: interaction.instance_url || data.instance_url,
            instance_script_path: data.instance_script.replace(':type:', 'observer'),
            instance_component_name: data.instance_component_name,
            instance_loaded: false
        });
        console.log(interaction);

        this.getInstance();
    }

    render() {
        if (this.state.instance_loaded) {
            let DynamicInteraction = window.interactions[this.state.instance_component_name];
            return (
                <DynamicInteraction {...this.props}
                    assignments={this.state.assignments}
                    url={this.state.instance_url}
                    socket={this.state.socket} />
            );
        } else {
            return (
                <div className="card-panel">
                    <h4>Observer</h4>
                    <p className={'flow-text'}>Waiting for interactions to open</p>
                    <div className="progress">
                        <div className="indeterminate"></div>
                    </div>
                </div>
            );
        }
    }
}

let run = function () {
    var qs = querystring.parse(window.location.search.substring(1)),
        socketBase = `//${window.location.hostname}:4000/`,
        socketURL = socketBase + 'socket.io/socket.io.js',
        channel = socketBase + 'observer';

    // Wait for socket code to load before activating React
    $.getScript(socketURL, () => {
        // Wait for DOM ready before activating React
        $(() => {
            React.render(
                <Interaction params={qs}
                             clickerClass={$context.class_name}
                             channel={channel}
                             date={new Date()}/>,
                document.getElementById('react-main')
            );
        });
    });
};
run();
