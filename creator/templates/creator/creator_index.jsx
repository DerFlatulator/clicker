/**
 * :file: creator/creator_index
 */

import React from 'react';
import $ from 'jquery';
import 'jquery.cookie';
import classNames from 'classnames';

class CreatorIndex extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            waiting: false
        };
        this.createInteraction = this.createInteraction.bind(this);
        this.onInteractionCreated = this.onInteractionCreated.bind(this);
    }

    createInteraction() {
        this.setState({waiting: true});

        $.ajax({
            url: '/api/interaction/',
            method: 'POST',
            contentType: 'application/json',
            data: {},
            success: this.onInteractionCreated,
            error: console.error.bind(console)
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
                    Click the button below to create an interaction:
                </p>

                <a onClick={this.createInteraction} className={buttonClasses}>
                    Create
                </a>
            </div>
        );
    }
}

let run = function () {
    $.ajaxSetup({
        beforeSend: req => req.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'))
    });

    React.render(
        <CreatorIndex user={$context.user} date={new Date()}/>,
        document.getElementById('react-main')
    );
};
run();