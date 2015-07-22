'use strict';

import $ from 'jquery';
import classNames from 'classnames';
import React from 'react';

class BubbleSort extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            indices: [0, 1],
            buttonEnabled: true,
            assignment: this.props.assignments[this.props.deviceId]
        };
    }

    componentDidMount() {
        console.log(this.state);

        this.setState({ indices: [
            this.state.assignment.lower_index, this.state.assignment.lower_index + 1
        ] });
    }

    swap() {
        this.setState({ buttonEnabled: false });
        $.post(this.state.assignment.swap_url, {
            lower_index: this.state.indices[0],
            bubble_sort: this.props.url
        }, this.swapDone.bind(this)).fail(this.swapDone.bind(this)).always(this.swapDone.bind(this));
    }

    swapDone() {
        this.setState({ buttonEnabled: true });
    }

    render() {
        var classes = classNames({
            'disabled': !this.state.buttonEnabled
        }, [
            'swapButton', 'waves-effect', 'waves-light', 'btn-large'
        ]);

        return (
            <div className="sortPanel">
                <p className="flow-text">You are responsible for <strong>interval {this.state.indices[0] + 1}</strong>.</p>
                <a onClick={this.swap.bind(this)} className={classes}>
                    <i className="material-icons left">swap_horiz</i>
                    Swap!
                </a>
                <p className="flow-text">Click SWAP when the number on the <em>left</em> is <strong>greater </strong>
                    than the number on the <em>right</em>.</p>
            </div>
        );
    }
}

window.interactions = window.interactions || {};
window.interactions['BubbleSort'] = BubbleSort;