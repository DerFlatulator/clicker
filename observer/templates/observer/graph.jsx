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
            label: "George Harrison",
            index: 0
        },
        {
            label: "John Lennon",
            index: 1
        },
        {
            label: "Ringo Starr",
            index: 2
        },
        {
            label: "Paul McCartney",
            index: 3
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

    static defaultProps = {
        r: 45,
        clickCallback: Vertex.handleClick
    };

    componentWillReceiveProps(newProps) {
        newProps.x = Math.max(this.props.r, Math.min(getWidth() - this.props.r, newProps.x));
        newProps.y = Math.max(this.props.r, Math.min(getHeight() - this.props.r, newProps.y));
    }

    static handleClick = (e) => {
        console.error("Undefined callback");
    };

    render() {
        if (this.props.deleted)
            return <g></g>;

        var x = this.props.x || 0;
        var y = this.props.y || 0;

        return (
            <g transform={`translate(${x},${y})`}
               onClick={this.props.clickCallback}
                style={{
                    cursor: "pointer"
                }}>
                <circle
                  r={this.props.r}
                  style={{
                    fill: d3.rgb(color(this.props.index)).darker(),
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

    static defaultProps = {
        r: 45,
    };

    componentWillReceiveProps(newProps) {
        newProps.source.x = Math.max(this.props.r,
            Math.min(getWidth() - this.props.r, newProps.source.x));
        newProps.source.y = Math.max(this.props.r,
            Math.min(getHeight() - this.props.r, newProps.source.y));
        newProps.target.x = Math.max(this.props.r,
            Math.min(getWidth() - this.props.r, newProps.target.x));
        newProps.target.y = Math.max(this.props.r,
            Math.min(getHeight() - this.props.r, newProps.target.y));
    }

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

class InfoPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static defaultProps = {
        vertex: null,
        harmonicCentrality: NaN
    };

    getContent() {
        var hCentrality = this.props.harmonicCentrality.toFixed(3);
        return (
            <div>
                Selected: {this.props.vertex ? this.props.vertex.label : "None"}
                <br />
                Harmonic Centrality: {hCentrality}
                <br />
                <img src="data:image/png;base64,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"/>

            </div>
        );
    }

    empty() {
        return <div>No selected vertex</div>;
    }

    render() {
        return (
            <div className="card-panel"
                 style={{position: 'absolute',
            bottom: 50, right: 30,
            width: 200, height: 'auto',
            border: '1px solid black',
            padding: 5,
            zIndex: 10001,
            background: 'rgba(255,255,255,0.5)'}}>
                {this.props.vertex && !this.props.vertex.deleted
                    ? this.getContent() : this.empty()}
            </div>
        );
    }

}

function getHeight() {
    return window.innerHeight  - $('footer').innerHeight() - $('nav').innerHeight();
}

function getHeightOffset() {
    return $('nav').innerHeight();
}

function getWidth() {
    return window.innerWidth;
}

class Graph extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            layout: "d3"
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

    setLayout = (e) => {
        //if (this.state.layout === "cola") {
        //    Storage.setItem('graph:layout-engine', 'd3');
        //} else if (this.state.layout === "d3") {
        //    Storage.setItem('graph:layout-engine', 'cola');
        //}
    };

    componentDidUpdate() {
        //$('.dropdown-button').dropdown({
        //        inDuration: 300,
        //        outDuration: 225,
        //        constrain_width: true, // Does not change width of dropdown to that of the activator
        //        hover: true, // Activate on hover
        //        gutter: 0, // Spacing from edge
        //        belowOrigin: false, // Displays dropdown below the button
        //        alignment: 'left' // Displays dropdown with edge aligned to the left of button
        //    }
        //);
    }

    render() {
        if (this.state.loaded) {
            return <div>
                <GraphApp
                width={getWidth()}
                height={getHeight()}
                layout={this.state.layout}
                data={this.state.graph}
                //data={graph}
                {...this.props} />
                </div>;

        } else {
            return <p className="flow-text">Getting some data...</p>
        }
    }
}

class GraphApp extends React.Component {

    constructor(props) {
        super(props);

        var force = this.setLayout();

        this.state = {
            svgWidth: props.width,
            svgHeight: props.height,
            force: force,
            edges: props.data.edges,
            vertices: props.data.vertices,
            playing: true,
            focussedVertex: null
        };
    }

    static defaultProps = {
        directed: false //  no support for directed graphs just yet
    };

    componentWillReceiveProps(newProps) {
        if (newProps.layout !== this.props.layout) {
            this.setState({ force: this.setLayout() });
        }
    }

    setLayout = (props) => {
        var props = props || this.props;

        var force = null;
        switch (props.layout) {
            case "cola":
                force = cola.d3adaptor()
                    .convergenceThreshold(1e-3)
                    .linkDistance(100)
                    .handleDisconnected(false)
                    .avoidOverlaps(true);
                break;
            case "d3":
                force = d3.layout.force()
                    .gravity(0.05)
                    .linkDistance(150)
                    .charge(-500);
                break;
        }
        force
            .size([props.width, props.height]);
        return force;
    };

    componentDidMount() {
        this.update();

        this.state.force.on("tick", (tick, b, c) => {
            if (this.state.playing === false)
                return;

            var q = d3.geom.quadtree(this.state.vertices);
            this.state.vertices.forEach((vertex) => q.visit(this.collide(vertex)));

            this.forceUpdate();
        });


        window.onbeforeunload = () => {
            this.props.socket.disconnect();
        };

        $(window).resize(this.resize);

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

        // this.demo2();
    }

    componentWillUnmount() {
        $(window).off("resize");
    }

    collide(node) {
        var r = 55,
            nx1 = node.x - r,
            nx2 = node.x + r,
            ny1 = node.y - r,
            ny2 = node.y + r;
        return function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== node)) {
                var x = node.x - quad.point.x,
                    y = node.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = 110;
                if (l < r) {
                    l = (l - r) / l * .5;
                    node.x -= x *= l;
                    node.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        };
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

        i++;i++;

        setTimeout(() => {
            this.removeVertex({label: "John Lennon" });
        }, i++*1000);
        setTimeout(() => {
            this.removeVertex({label: "George Harrison" });
        }, i++*1000);
    }

    demo2() {
        for (var i = 1; i < 80; i++) {
            if (i % 2 === 1)
                setTimeout(() => {
                    this.addVertex({ label: `#${this.state.vertices.length}` });
                }, i * 1000);
            else
                setTimeout(() => {
                    this.addEdge({
                        source: Math.floor(Math.random()*this.state.vertices.length),
                        target: Math.floor(Math.random()*this.state.vertices.length)
                    });
                }, i * 1000);
        }
    }

    demo3() {
        for (let i = 1; i < 40; i++) {
            this.addVertex({ label: `#${this.state.vertices.length}` });
        }
        for (let i = 1; i < 80; i++) {
            setTimeout(() => {
                this.addEdge({
                    source: Math.floor(Math.random()*this.state.vertices.length),
                    target: Math.floor(Math.random()*this.state.vertices.length)
                });
            }, i * 500);
        }

    }

    update() {
        this.state.vertices.forEach(function (v) { v.width = 200; v.height = 200 });
        this.state.force
            .nodes(this.state.vertices)
            .links(this.state.edges)
            .start();

        //if (this.state.playing === null)
        //    this.state.force.start();
        //else if (this.state.playing)
        //    this.state.force.resume();
    }

    togglePause = () => {
        if (this.state.playing) {
            //this.state.force.stop();
            this.setState({ playing: false });
        } else {
            //this.state.force.resume();
            this.setState({ playing: true });
        }
    };

    resize = () => {
        console.log('size');
        this.setState({
            svgHeight: getHeight(),
            svgWidth: getWidth()
        });
    };

    addEdge(edge) {
        if (this.state.edges.filter((e) => {
                return e.source === edge.source && e.target === edge.target
                || ((!this.props.directed)
                    && e.source === edge.target && e.target === edge.source)
        }).length === 0) {
            this.state.edges.push(edge);
            var source = this.state.vertices[edge.source],
                target = this.state.vertices[edge.target];

            Materialize.toast(`New edge from "${source.label}" to "${target.label}"`,
                1000, 'green');
            this.update();

        }

    }

    removeEdge(edge) {
        this.state.edges = this.state.edges.filter((e) => {
            return !(e.source.index === edge.source && e.target.index === edge.target);
        });

        this.update();
    }

    addVertex(vertex) {
        // https://github.com/tgdwyer/WebCola/blob/master/WebCola/examples/pageBoundsConstraints.html
        //var constraints = [];
        //var i = this.state.vertices.length,
        //    nodeRadius = 45;
        //constraints.push({ axis: 'x', type: 'separation',
        //    left: tlIndex, right: i, gap: nodeRadius });
        //constraints.push({ axis: 'y', type: 'separation',
        //    left: tlIndex, right: i, gap: nodeRadius });
        //constraints.push({ axis: 'x', type: 'separation',
        //    left: i, right: brIndex, gap: nodeRadius });
        //constraints.push({ axis: 'y', type: 'separation',
        //    left: i, right: brIndex, gap: nodeRadius });
        //vertex.constraints = constraints;

        this.state.vertices.push(vertex);
        Materialize.toast(`Added vertex "${vertex.label}"`, 1000, 'green');

        this.update();
    }

    removeVertex(vertex) {
        // remove vertex
        Materialize.toast(`Removed vertex "${vertex.label}"`, 1000, 'red');

        vertex = this.state.vertices.filter((v) => {
            if (v.label === vertex.label) {
                return v;
            }
        })[0];
        var index = vertex.index;
        vertex.deleted = true;
        // remove all edges to/from this vertex
        this.state.edges = this.state.edges.filter((e) => {
            return !(e.source.index === index  || e.target.index === index);
        });
        this.update();
    }

    labelVertex({ index, label }) {
        if (this.state.vertices.length <= index)
            console.error("Don't have that many vertices:", index);
        else {
            this.state.vertices[index].label = label;
            Materialize.toast(`New vertex label "${label}"`, 2000, 'green');
            this.update();
        }
    }

    vertexClick = (index) => {
        var vertex = this.state.vertices[index];
        this.setState({ focussedVertex: vertex });
        // alert(this.calculateHarmonicCentrality(vertex));
    };

    bfs(x) {
        this.state.vertices.forEach((v) => {
            v.distance = Number.POSITIVE_INFINITY;
            v.parent = null;
        });
        var queue = [];
        x.distance = 0;
        queue.unshift(x);

        while (queue.length) {
            let u = queue.pop();

            //console.log("visit", u.label);

            this.getAdjacent(u).forEach((v) => {
                // console.log("adjacent", v.label);

                if (v.distance === Number.POSITIVE_INFINITY) {
                    v.distance = u.distance + 1;
                    v.parent = u;
                    queue.unshift(v);
                }
            })
        }
    }

    calculateHarmonicCentrality(x) {
        if (x === null) return NaN;

        // H(x) = sum_{y!=x} 1 / d(x, y)

        // creates .distance and .parent attributes on all vertex objects.
        this.bfs(x);
        let sum = 0;

        this.state.vertices.forEach((y) => {
            if (x.index === y.index)
                return;

            if (y.deleted)
                return;
            var d = y.distance;
            if (d === Number.POSITIVE_INFINITY)
                sum += 0; // 1 / inf := 0
            else
                sum += 1.0 / d;
        });
        return sum;
    }

    getAdjacent(vertex) {
        var adj = [];
        this.state.edges.forEach((edge) => {
            if (edge.source.index === vertex.index) {
                adj.push(edge.target)
            }
            if (!this.props.directed && edge.target.index === vertex.index) {
                adj.push(edge.source);
            }
        });
        return adj;
    }

    // GraphApp Drawing

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
                    clickCallback={this.vertexClick.bind(this, index)}
                    {...vertex} />
            );
        });

        return nodes;
    }

    render() {
        return (
          <div>
            <p className="flow-text">Graph Viewer</p>
              {<a className='btn'
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '80px',
                    zIndex: '1001 !important'
                   }}
                  href='#' onClick={this.togglePause}>{this.state.playing===false ? "play" : "pause"}</a>
              }
              <InfoPanel
                  vertex={this.state.focussedVertex}
                  harmonicCentrality={this.calculateHarmonicCentrality(this.state.focussedVertex)} />
              <svg
              style={{border: "0 solid black",
              position: "absolute",
              top: getHeightOffset(), left: 0,
              zIndex: 1000 }}
              width={this.state.svgWidth}
              height={this.state.svgHeight}>
              {this.drawEdges()}
              {this.drawVertices()}
            </svg>
          </div>
        );
    }
}

window.interactions = $.extend(window.interactions, { Graph });