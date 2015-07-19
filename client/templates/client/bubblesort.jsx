'use strict';

import $ from 'jquery';
import classNames from 'classnames';
import React from 'react';
import 'jquery.cookie'; // $.cookie
import querystring from 'querystring';

class BubbleSort extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            indices: [0, 1],
            buttonEnabled: true
        };
    }

    componentDidMount() {
        this.setState({ indices: [
            this.props.lower_index, this.props.lower_index + 1
        ] });
    }

    swap() {
        this.setState({ buttonEnabled: false });
        $.post(this.props.swapURL, {
            lower_index: this.state.indices[0],
            // bubble_sort: '//' + window.location.host + this.props.url
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

let run = function () {
    $.ajaxSetup({
        beforeSend: req => req.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'))
    });

    var qs = querystring.parse(window.location.search.substring(1)),
        instance = parseInt(qs.instance) || 1,
        lower_index = parseInt(qs.lower_index) || 0,
        url = `/api/bubblesort/${instance}/`,
        swapURL = `/api/bubblesortswap/`;

    React.render(
        <BubbleSort instance={instance} url={url} swapURL={swapURL} lower_index={lower_index} date={new Date()}/>,
        document.getElementById('react-main')
    );
};
run();