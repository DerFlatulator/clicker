"use strict";

/**
 * :file: /client/templates/client/graph
 */

import classNames from 'classnames';
import Materialize from 'materialize';

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buttonEnabled: true,
            loadedVertex: false,
            loadedAllVertices: false,
            loaded: false,
            vertices: [],
            vertex: null,
            vertex_url: props.assignments.vertices[props.deviceId]
        };
    }

    static defaultProps = {
    };

    componentDidMount() {
        $.ajax({
            url: this.state.vertex_url,
            dataType: 'json',
            method: 'GET',
            cache: false,
            success: (data) => {
                this.setState({
                    loadedVertex: true,
                    vertex: data
                });
                if (this.state.loadedAllVertices)
                  this.setState({ loaded: true });
            },
            error: (xhr, status, err) => {
                console.error(xhr, status, err.toString());
            }
        });

        // get all vertices, edges
        $.getJSON(this.props.urls.source, ({ vertices, edges }) => {
            this.setState({
                vertices: vertices,
                edges: edges,
                loadedAllVertices: true
            });
            if (this.state.loadedVertex)
                this.setState({ loaded: true });

        });
    }

    vertexFromLabel(label) {
        var r = this.state.vertices.filter((vertex) => {
            return vertex.label === label;
        });
        if (r.length)
          return r[0];
        return null;
    }

    submitEdge = (e) => {
        //var plotForm = React.findDOMNode(this.refs.form);
        //if (typeof(plotForm.checkValidity) === "function" &&
        //    !plotForm.checkValidity()) {
        //    return;
        //}
        var field = React.findDOMNode(this.refs.select_edge_to);
        var target = field.value;

        if (target.length < 1) {
            alert("Please enter a label to add an edge to");
            return;
        }

        // var toVertex = this.vertexFromLabel(target);
        var toVertex = this.state.vertices[target];
        //console.log(target, toVertex);

        var data = {
            graph: this.props.urls.source,
            //weight
            //line_color
            //label
            source: this.state.vertex.url,
            target: toVertex.url
        };

        $.ajax({
            url: '/api/graphedge/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            dataType: 'json',
            success: this.submitEdgeDone,
            error: (xhr, status, err) => {
                console.error(this.state.vertex_url, status, err.toString());
            }
        });

    };

    submitLabel = (e) => {
        var field = React.findDOMNode(this.refs.vertex_label);
        var label = field.value;
        if (label.length < 1) {
            alert("Please enter a label first");
            return;
        }
        this.state.vertex._label = this.state.vertex.label;
        this.state.vertex.label = label;

        this.setState({ buttonEnabled: false });
        $.ajax({
            url: this.state.vertex_url,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(this.state.vertex),
            dataType: 'json',
            success: this.submitLabelDone,
            error: (xhr, status, err) => {
                console.error(this.state.vertex_url, status, err.toString());
            }
        });

    };

    submitLabelDone = () => {
        this.setState({ buttonEnabled: true });
        this.forceUpdate();
        Materialize.toast("Successfully Updated Label", 3000, "green");
    };

    submitEdgeDone = () => {
        this.setState({ buttonEnabled: true });
        this.forceUpdate();
        Materialize.toast("Successfully Added an Edge", 3000, "green");
    };

    render() {
        if (this.state.loaded) {
            var stage = this.renderForm();
            return <div>{stage}</div>;

        } else {
            return <p className="flow-text">Getting some data...</p>
        }
    }

    componentDidUpdate() {
        if (!$('#select_edge_to').hasClass("initialized"))
            $('#select_edge_to').material_select();
    }

    renderForm() {
        var btnClasses = classNames({
            'disabled': !this.state.buttonEnabled
        }, 'swapButton', 'waves-effect', 'waves-light', 'btn');
        var vertexLabel = this.state.vertex ? this.state.vertex.label : "?";
        var vertexIndex = this.state.vertex ? this.state.vertex.index : -1;
        return <form ref='form'>
            <div>
                <p className='flow-text'>Modify your vertex:</p>
            </div>
            <div className='input-field col s12 m6'>
                <label>Your Vertex Label</label>
                <input
                    className="validate"
                    min-length={1}
                    type="text" ref="vertex_label" defaultValue={vertexLabel} readOnly={false} />
                <button onClick={this.submitLabel} className={btnClasses}>
                    <i className="material-icons right">send</i>
                    Label Your Vertex
                </button>
            </div>
            <div className='input-field col s12 m6'>
                <label>Add Edge From '{vertexLabel}' To...</label>
                {/*<input type="text" ref="edge_to" />*/}
                <select id="select_edge_to" ref="select_edge_to"
                    value={this.state.vertices[0].index}>
                    {this.state.vertices.map((v) =>{
                        if (v.index !== vertexIndex)
                            return <option key={v.index} value={v.index}>{v.label}</option>;
                        }
                    )}
                </select>

                <button onClick={this.submitEdge} className={btnClasses}>
                    <i className="material-icons right">send</i>
                    Create Edge
                </button>
            </div>
            <div>
            </div>
        </form>;
    }
}

$(document).on('submit', 'form', (e) => {
    e.preventDefault();
    return false;
});

window.interactions = $.extend(window.interactions, { Graph });
