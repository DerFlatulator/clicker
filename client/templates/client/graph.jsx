"use strict";

/**
 * :file: /client/templates/client/graph
 */

import classNames from 'classnames';

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buttonEnabled: true
        };
    }

    static defaultProps = {
    };

    submit = (e) => {
        var plotForm = React.findDOMNode(this.refs.form);
        if (typeof(plotForm.checkValidity) === "function" &&
            !plotForm.checkValidity()) {
            return;
        }
    };

    render() {
        var stage = renderForm();
        return <div>{stage}</div>;
    }

    renderForm() {
        var btnClasses = classNames({
            'disabled': !this.state.buttonEnabled
        }, 'swapButton', 'waves-effect', 'waves-light', 'btn-large');

        return <form ref='form'>
            <div>
                <p className='flow-text'>Data entry...</p>
            </div>
            <div className='input-field col s12 m6'>
            </div>
            <div>
                <button onClick={this.submit} className={btnClasses}>
                    <i className="material-icons right">send</i>
                    Submit
                </button>
            </div>
        </form>;
    }
}

$(document).on('submit', 'form', (e) => {
    e.preventDefault();
    return false;
});

window.interactions = $.extend(window.interactions, { Graph });
