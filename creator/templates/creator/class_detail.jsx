"use strict";

/**
 * :file: creator/creator_detail
 */

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import 'jquery.cookie';
import classNames from 'classnames';


class CreatorDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            waiting: false,
            clickerClass: this.props.clicker_class,
            selectedItem: '*',
            graphRulesItem: '*',
            selectedItemName: '',
            interactions: this.props.interactions
        };
    }

    createInteraction = (interaction_type) => {
        if (this.state.waiting)
            return;

        this.setState({waiting: true});

        if (this.state.selectedItem === '*')
            return;

        var item = this.state.selectedItem;

        var data = {
            class_name: this.props.class_name,
            interaction_slug: item
        };

        if (item === 'graph') {
            data.rules_url = this.state.graphRulesItem;
        }

        $.ajax({
            url: `/api/${this.state.selectedItem}/generate/`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: this.onInteractionCreated,
            error: console.error.bind(console)
        });
    };

    deleteInteraction = (url, event) => {
        $.ajax({
            url,
            method: 'DELETE',
            dataType: 'json',
            success: this.onInteractionDeleted,
            error: console.error.bind(console)
        });
    };

    reload = () => {
        $.getJSON(`/api/interaction/?creator=${this.props.user}`, (data) => {
            this.setState({
                interactions: data.results
            });
        })
    };

    componentDidMount() {
        $('select').material_select();
    }

    componentDidUpdate() {
        $('.tooltip').tooltip();
    }

    handleChange = (event) => {

        var name = this.props.types.map(type => {
            if (type.slug_name === event.target.value)
                return type.long_name;
        }).filter(type => !!(type))[0];

        this.setState({
            selectedItem: event.target.value,
            selectedItemName: name
        });

    };

    handleRulesChange = (event) => {
        this.setState({
            graphRulesItem: event.target.value
        });
    };

    onInteractionCreated = (data) => {
        console.log(data);
        this.setState({waiting: false});

        this.reload();
    };

    onInteractionDeleted = (data) => {
        console.log(data);

        this.reload();
    };

    clearDevices = () => {
        $.ajax({
            url: `/api/class/${this.props.class_name}/cleardevices/`,
            method: 'POST',
            data: {},
            dataType: 'json',
            success: this.onClearedDevices,
            error: console.error.bind(console)
        });
    };

    onClearedDevices = (data) => {
        var clickerClass = this.state.clickerClass;
        clickerClass.connected_devices = 0;
        this.setState({ clickerClass: clickerClass });
    };

    render() {
        var buttonClasses = classNames('waves-effect waves-light btn-large', {
            'disabled': this.state.waiting
        });

        var graphTypes = <span></span>;

        if (this.state.selectedItem === 'graph') {
            graphTypes = <select defaultValue='*'
                                 className="browser-default"
                                 onChange={this.handleRulesChange}>
                <option value="*" disabled>Choose graph rule set</option>

                {this.props.graph_rulesets.map(rules => {
                    return (
                        <option
                            key={rules.url}
                            value={rules.url}>
                            {rules.title}
                        </option>
                    );
                })}
            </select>
        }

        return (
            <div className={'card-panel'}>
                <h3>Creator</h3>

                <h4>Class: <strong>{this.props.clicker_class.long_name}</strong></h4>

                <div className="row">
                    <div className="col s8">
                        <h5>Connected Devices: <strong>{this.state.clickerClass.connected_devices}</strong></h5>
                    </div>
                    <div className="col s4">
                        <a onClick={this.clearDevices} className={'red darken-3 waves-effect waves-light btn'}>
                            Clear All
                            <i className="material-icons right">remove_circle</i>
                        </a>
                    </div>
                </div>


                <ul className="collection with-header">
                    <li className="collection-header">
                        <h4>Available Interactions</h4>
                    </li>
                    {this.state.interactions.length == 0 ?
                        <li className="collection-item" key="none">None</li> : ''
                    }
                    {this.state.interactions.map(interaction => {
                        return (
                            <li className="collection-item"
                                key={interaction.url}>
                                <div>
                                    State: {interaction.state_name}&nbsp;&mdash;&nbsp;
                                    {interaction.long_name}&nbsp;&mdash;&nbsp;
                                    {interaction.description}
                                    <div  className='secondary-content'>
                                        <a href="#!" onClick={this.deleteInteraction.bind(this, interaction.url)}
                                           className="red-text ">
                                            <i data-tooltip="Delete Interaction" data-position='left'
                                               className="material-icons right tooltip">delete</i>
                                        </a>
                                        {interaction.state_name !== "Active" ?
                                            <a href="#!">
                                                <i data-tooltip="Activate Interaction" data-position='left'
                                                   className="teal-text tooltip material-icons right">send</i>
                                            </a>
                                                :
                                            <a href="#!">
                                                <i data-tooltip="De-activate Interaction" data-position='left'
                                                   className="orange-text tooltip material-icons right">cancel</i>
                                            </a>
                                        }
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <hr />

                <p className={'flow-text'}>
                    Click the button below to create an interaction
                    &nbsp;{this.state.selectedItem==='*' ? '' : `(${this.state.selectedItemName})`}
                </p>

                <form>
                    <div className="row">
                        <div className="col s12 m8">
                            <select defaultValue='*' className="browser-default" onChange={this.handleChange}>
                                <option value="*" disabled>Choose interaction type</option>

                                {this.props.types.map(type => {
                                   return (
                                    <option
                                        key={type.slug_name}
                                        value={type.slug_name}>
                                        {type.long_name}
                                    </option>
                                   );
                                })}

                            </select>

                            {graphTypes}
                        </div>
                        <div className="col s12 m4">
                            <a onClick={this.createInteraction} className={buttonClasses}>
                                Create
                                <i className="material-icons right">add_circle</i>
                            </a>
                        </div>
                    </div>
                </form>

                <a href="/creator/">Back to my classes.</a>
            </div>
        );
    }
}

let run = function () {
    $.ajaxSetup({
        beforeSend: req => req.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'))
    });

    ReactDOM.render(
        <CreatorDetail user={$context.user}
                       class_name={$context.class_name}
                       clicker_class={$context.clicker_class}
                       types={$context.types}
                       interactions={$context.interactions}
                       graph_rulesets={$context.graph_rulesets}
                       date={new Date()}/>,
        document.getElementById('react-main')
    );
};
run();