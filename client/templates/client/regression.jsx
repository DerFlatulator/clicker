"use strict";

/**
 * :file: /client/templates/client/regression
 */

import classNames from 'classnames';
import React from 'react';

class Regression extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stage: 0,
            buttonEnabled: true
        };
    }

    static defaultProps = {
        axis: {
            x: {
                label: "weight (kg)",
                minVal: 1,
                maxVal: 500
            },
            y: {
                label: "height (cm)",
                minVal: 1,
                maxVal: 500
            }
        }
    };

    submitPlotPoint = (e) => {
        var plotForm = React.findDOMNode(this.refs.plotForm);
        if (typeof(plotForm.checkValidity) === "function" &&
            !plotForm.checkValidity()) {
            return;
        }

        var x = this.refs.x.getDOMNode().value,
            y = this.refs.y.getDOMNode().value;

        $.post(this.props.urls.plot_items, {
            regression: this.props.urls.source,
            x_val: x,
            y_val: y
        });
    };

    render() {
        var stage = '';
        switch (this.state.stage) {
        case 0:
            stage = this.renderInputFields();
            break;
        case 1:
            stage = this.renderRegressionSliders();
            break;
        }

        return <div>{stage}</div>;
    }

    renderInputFields() {
        var btnClasses = classNames({
            'disabled': !this.state.buttonEnabled
        }, 'swapButton', 'waves-effect', 'waves-light', 'btn-large');

        return <form ref='plotForm'>
            <div>
                <p className='flow-text'>Enter some data for plotting</p>
                <p>(This data is sent anonymously)</p>
            </div>
            <div className='input-field col s12 m6'>
                <label>[x-axis] Your {this.props.axis.x.label}</label>
                <input ref='x'
                       type='number'
                       min={this.props.axis.x.minVal}
                       max={this.props.axis.x.maxVal}
                       required='required'
                       className='validate'></input>
            </div>
            <div className='input-field col s12 m6'>
                <label>[y-axis] Your {this.props.axis.y.label}</label>
                <input ref='y'
                       type='number'
                       required='required'
                       min={this.props.axis.y.minVal}
                       max={this.props.axis.y.maxVal}
                       className='validate'></input>
            </div>
            <div>
                <button onClick={this.submitPlotPoint} className={btnClasses}>
                    <i className="material-icons right">send</i>
                    Submit Plot Point
                </button>
            </div>
        </form>;
    }

    renderRegressionSliders() {
        return <span>sliders...</span>;
    }
}

$(document).on('submit', 'form', (e) => {
    e.preventDefault();
    return false;
});

window.interactions = $.extend(window.interactions, { Regression });