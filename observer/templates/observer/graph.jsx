"use strict";

/**
 * :file: /observer/templates/observer/graph
 */

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            graph: {
                nodes: [],
                links: []
            },
            numResponses: 0
        };
    }

    static defaultProps = {
    };

    render() {
        return (
            <div>
                <p className='flow-text'>Graph Viewer</p>
            </div>
        );
    }
}

window.interactions = $.extend(window.interactions, { Graph });