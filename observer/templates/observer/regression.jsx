"use strict";

/**
 * :file: /observer/templates/observer/regression
 */

import React from "react";

class Regression extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stage: 0,
            numResponses: 0
        };
    }

    render() {
        var stage = '';
        switch (this.state.stage) {
            case 0:
                return this.displayNumberOfResponses();
                break;
            case 1:
                return this.renderRegressionSliders();
                break;
        }

        return (
            <div>
                {stage}
            </div>
        );
    }

    displayNumberOfResponses() {
        return <span>Number of responses: {this.state.numResponses}</span>;
    }

    renderRegressionSliders() {
        return <span>observer sliders...</span>;
    }
}

window.interactions = $.extend(window.interactions, { Regression });