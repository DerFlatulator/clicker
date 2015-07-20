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
        //this.createInteraction = this.createInteraction.bind(this);
        //this.onInteractionCreated = this.onInteractionCreated.bind(this);
    }

    componentDidUpdate() {
        $('.modal-trigger').leanModal();
        $('.tooltip').tooltip({delay: 50});
    }


    render() {
        var buttonClasses = classNames('waves-effect waves-light btn-large modal-trigger', {
            'disabled': this.state.waiting
        });

        return (
<div className="card-panel">
    <div className="card-content">
        <span className="card-title activator grey-text text-darken-4">Clicker++ Creator</span>
        <p>Your classes:</p>
        <div className="row">
            <div className="col s12 m12 l8">
                <ul className="collection">
                    {this.props.classes.map(cls => {
                        return (
                            <li className="collection-item avatar">
                                <i className="material-icons circle green mdi-action-assessment"></i>
                                <span className="title">{cls.fields.long_name}</span>
                                <p>Class is open for observation.</p>
                                <a href={`/creator/${cls.fields.class_name}/`}
                                   className="secondary-content waves-effect waves-light btn">
                                    View Class
                                </a>
                            </li>
                        );
                    })}
                </ul>
                <a data-trigger="newclass-modal" className={buttonClasses}>
                    New class
                </a>
            </div>
        </div>
    </div>
    <NewClassModal />
</div>
        );
    }
}

class NewClassModal extends React.Component {
    render() {
        return (
<div id="newclass-modal" className="modal modal-fixed-footer textLeft">
    <div className="modal-content">
        <h4>New Class</h4>
        <p>TODO...</p>
    </div>
    <div className="modal-footer">
        <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Got it!</a>
    </div>
</div>
        );
    }
}

let run = function () {
    $.ajaxSetup({
        beforeSend: req => req.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'))
    });

    React.render(
        <CreatorIndex user={$context.user}
                      classes={$context.classes}
                      date={new Date()}/>,
        document.getElementById('react-main')
    );
};
run();