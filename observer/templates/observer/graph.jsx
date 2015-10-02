"use strict";

/**
 * :file: /observer/templates/observer/graph
 */

import 'd3';
import cola from 'webcola';
import $ from 'jquery';

var color = d3.scale.category20();


var graph = {
    vertices: [
        {
            label: "George Harrison"
        },
        {
            label: "John Lennon"
        },
        {
            label: "Ringo Starr"
        },
        {
            label: "Paul McCartney"
        }
    ],
    edges: [
    ]

};

class Vertex extends React.Component {

    constructor(props) { super(props); }

    textRows(txt, x) {

        var lines = txt.split(" ");
        var offset = -20 * (lines.length-1)/2 + 5;
        return lines.map((word, i) => {
            if (i === 0)
                return <tspan key={i} x={0} dy={offset}>{word}</tspan>;

            return <tspan key={i} x={0} dy={20}>{word}</tspan>;
        });
    }

    render() {
        var x = this.props.x || 0;
        var y = this.props.y || 0;

        return (
            <g transform={`translate(${x},${y})`}>
                <circle
                  r={50}
                  style={{
                    fill: color(this.props.group),
                    stroke: "#fff",
                    strokeWidth: "1.5px"
                  }}>
                </circle>
                <text dy={5} textAnchor="middle" fill= "white">
                    {this.textRows(this.props.label, x)}
                </text>
            </g>
        )
    }
}

class Edge extends React.Component {

    constructor(props) { super(props); }

    render() {
        var source = this.props.source,
            target = this.props.target;

        return (
          <line
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            style={{
              stroke: "#999",
              strokeOpacity: 1,
              strokeWidth: "3px"
            }}/>
        );
    }
}

function getHeight() {
    return window.innerHeight - $('nav').innerHeight() - $('footer').innerHeight();
}

function getWidth() {
    return $('#react-main').innerWidth();
}

class Graph extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        }
    }

    componentDidMount() {
        $.getJSON(this.props.urls.source, (data) => {
            this.setState({
                loaded: true,
                graph: this.preProcess(data)
            });
        });
    }

    preProcess(graph) {
        var derefObj = {};

        function dereference(url) {
            if (url in derefObj) {
                return derefObj[url];
            } else {
                derefObj[url] = graph.vertices.filter((vertex) => vertex.url === url)[0];
                return derefObj[url];
            }
        }
        graph.edges.forEach((edge) => {
            edge.source = dereference(edge.source).index;
            edge.target = dereference(edge.target).index;
        });
        return graph;
    }

    render() {
        if (this.state.loaded) {
            return <GraphApp
                width={getWidth()}
                height={getHeight()}
                data={this.state.graph}
                // data={graph}
                {...this.props} />;

        } else {
            return <p className="flow-text">Getting some data...</p>
        }
    }
}

class GraphApp extends React.Component {
    // mixins: [Radium.StyleResolverMixin, Radium.BrowserStateMixin],
    constructor(props) {
        super(props);

        var force =
            //cola.d3adaptor()
            d3.layout.force().charge(-3000)
            //.handleDisconnected(false)
            .linkDistance(200)
            //.convergenceThreshold(1e-9)
            //.avoidOverlaps(true)
            .size([props.width, props.height]);


        this.state = {
            svgWidth: props.width,
            svgHeight: props.height,
            force: force,
            edges: this.props.data.edges,
            vertices: this.props.data.vertices
        };

        console.log(this.state.edges, this.state.vertices);
    }

    componentDidMount() {
        this.update();

        this.state.force.on("tick", (tick, b, c) => {
            this.forceUpdate();
        });


        window.onbeforeunload = () => {
            this.props.socket.disconnect();
        };

        var m_type = `graph.${this.props.clickerClass}`;
        this.props.socket.on(m_type, message => {
            let data = JSON.parse(message);
            let url = this.props.urls.source;
            console.log(data.graph, url, data);
            if (url === `/api/graph/${data.graph}/`) {
                if (data.event_type === 'add_vertex') {
                    this.addVertex({ label: data.label });
                }
                if (data.event_type === 'add_edge') {
                    this.addEdge({ source: data.source, target: data.target });
                }
                if (data.event_type === 'remove_edge') {
                    this.removeEdge({ source: data.source, target: data.target });
                }
                if (data.event_type === 'label_vertex') {
                    this.labelVertex({ index: data.index, label: data.label });
                }
            }
        });

        //this.demo();
    }

    demo() {
        var i = 3;
        setTimeout(() => {
            this.addEdge({source: 1, target: 3});
        }, i++*1000);
        setTimeout(() => {
            this.addEdge({source: 0, target: 3});
        }, i++*1000);
        setTimeout(() => {
            this.addEdge({source: 2, target: 3});
        }, i++*1000);
        setTimeout(() => {
            this.addEdge({source: 1, target: 2});
        }, i++*1000);
        setTimeout(() => {
            this.addEdge({source: 0, target: 2});
        }, i++*1000);
        setTimeout(() => {
            this.addEdge({source: 0, target: 1});
        }, i++*1000);

        i++;
        setTimeout(() => {
            this.addVertex({label: "Yoko Ono"});
        }, i++*1000);
        i++;
        // yoko...
        setTimeout(() => {
            this.addEdge({source: 4, target: 1});
        }, i++*1000);
        i++;
        setTimeout(() => {
            this.removeEdge({source: 0, target: 1});
        }, i++*1000);
        setTimeout(() => {
            this.removeEdge({source: 1, target: 2});
        }, i++*1000);
        setTimeout(() => {
            this.removeEdge({source: 1, target: 3});
        }, i++*1000);
    }

    update() {
        this.state.vertices.forEach(function (v) { v.width = 100; v.height = 100 });

        this.state.force
            .nodes(this.state.vertices)
            .links(this.state.edges)
            .start();
    }

    addEdge(edge) {
        this.state.edges.push(edge);
        this.update();
    }

    removeEdge(edge) {
        this.state.edges = this.state.edges.filter((e) => {
            if (e.source.index === edge.source && e.target.index === edge.target) {
                return false;
            }
            return true;
        });

        this.update();
    }

    addVertex(vertex) {
        this.state.vertices.push(vertex);
        this.update();
    }

    labelVertex({ index, label }) {
        if (this.state.vertices.length <= index)
            console.error("Don't have that many vertices:", index);
        else {
            this.state.vertices[index].label = label;
            this.update();
        }
    }

    drawEdges() {
        var links = this.state.edges.map(function (edge, index) {
            return (<Edge {...edge} key={index} />)
        });

        return (
            <g>{links}</g>
        );
    }

    drawVertices() {
        var nodes = this.state.vertices.map((vertex, index) => {
            return (<Vertex
                key={index}
                x={vertex.x / 100 * this.props.svgWidth}
                y={vertex.y / 100 * this.props.svgHeight}
                {...vertex} />
            );
        });

        return nodes;
    }

    render() {
        return (
          <div style={{position: "absolute"}}>
            <p className="flow-text">Graph Viewer</p>
            <div style={{marginLeft: "20px"}}>
            </div>

            <svg
              style={{border: "0 solid black",
              position: "absolute",
              top: 0, left: 0}}
              width={this.state.svgWidth}
              height={this.state.svgHeight}>
              {this.drawEdges()}
              {this.drawVertices()}
            </svg>
          </div>
        )
    }
};


window.interactions = $.extend(window.interactions, { Graph });