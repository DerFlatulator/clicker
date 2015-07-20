"use strict";

/**
 * :file: creator/creator_detail
 */

import React from 'react';
import $ from 'jquery';
import 'jquery.cookie';
import classNames from 'classnames';

class CreatorDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            waiting: false,
            selectedItem: '*',
            selectedItemName: ''
        };
        this.createInteraction = this.createInteraction.bind(this);
        this.onInteractionCreated = this.onInteractionCreated.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    createInteraction(interaction_type) {
        this.setState({waiting: true});

        if (this.state.selectedItem === '*')
            return;

        $.ajax({
            url: `/api/${this.state.selectedItem}/generate/`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                class_name: this.props.class_name,
                interaction_slug: this.state.selectedItem
            }),
            success: this.onInteractionCreated,
            error: console.error.bind(console)
        });
    }


    componentDidMount() {
        $('select').material_select();
    }

    componentDidUpdate() {
    }

    handleChange(event) {

        var name = this.props.types.map(type => {
            if (type.fields.slug_name === event.target.value)
                return type.fields.long_name;
        }).filter(type => !!(type))[0];

        this.setState({
            selectedItem: event.target.value,
            selectedItemName: name
        });

    }

    onInteractionCreated(data) {
        console.log(data);
        this.setState({waiting: false});
    }

    render() {
        var buttonClasses = classNames('waves-effect waves-light btn-large', {
            'disabled': this.state.waiting
        });

        return (
            <div className={'card-panel'}>
                <h3>Creator</h3>

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
                                    <option value={type.fields.slug_name}>{type.fields.long_name}</option>
                                   );
                                })}
                            </select>
                        </div>
                        <div className="col s12 m4">
                            <a onClick={this.createInteraction} className={buttonClasses}>
                                Create
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

let run = function () {
    $.ajaxSetup({
        beforeSend: req => req.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'))
    });

    React.render(
        <CreatorDetail user={$context.user}
                       class_name={$context.class_name}
                       types={$context.types}
                       interactions={$context.interactions}
                       date={new Date()}/>,
        document.getElementById('react-main')
    );
};
run();