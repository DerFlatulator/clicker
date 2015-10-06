"use strict";

/**
 * :file: /observer/templates/observer/graph
 */

import 'd3';
import cola from 'webcola';
import $ from 'jquery';
import React from 'react';

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

var empty = {
    vertices: [], edges: []
};

class Vertex extends React.Component {

    constructor(props) {
        super(props);
    }

    static defaultProps = {
        radius: 45,
        clickCallback: Vertex.handleClick
    };

    componentDidMount() {
        d3.select('g.id'+this.props.d3Node.index)
            .datum(this.props.d3Node)
            .call(this.props.force.drag);
    }

    componentWillReceiveProps(newProps) {
    }

    textRows(txt, x) {

        var lines = txt.split(" ");
        var offset = -20 * (lines.length-1)/2 + 5;
        return lines.map((word, i) => {
            if (i === 0)
                return <tspan key={i} x={0} dy={offset}>{word}</tspan>;

            return <tspan key={i} x={0} dy={20}>{word}</tspan>;
        });
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
               className={'id'+this.props.index}
                style={{
                    cursor: "pointer"
                }}>
                <circle
                  r={this.props.radius}
                  style={{
                    fill: d3.rgb(color(this.props.index)).darker(),
                    stroke: this.props.selected
                    ? "#e00"
                    : this.props.fixed ? "#000" : "#fff",
                    strokeWidth: "1.5px",
                    opacity: 0.9
                    //style: 'filter:url(#dropshadow)',
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
            hidden: false,
            fontSize: 100
        };
        this.panelWidth = 0;
        this.panelHeight = 0;
    }

    static defaultProps = {
        vertex: null,
        harmonicCentrality: NaN,
        radius: NaN,
        diameter: NaN,
        eccentricity: NaN,
        averageHarmonicCentrality: NaN,
        maximumClusterSize: NaN,
        fullHeight: 'auto', //250,
        fullWidth: 'auto'
    };

    show = () => {
        this.setState({ hidden: false });
        // as of React 0.14 refs.panel is a DOM Node. No need for {.getDOMNode()}
        $(this.refs.panel).fadeIn(1000);
    };

    hide = () => {
        this.setState({ hidden: true });
        $(this.refs.panel).fadeOut(1000);
    };

    fontPlus = () => {
        this.setState({
            fontSize: this.state.fontSize + 10
        });
    };

    fontMinus = () => {
        this.setState({
            fontSize: this.state.fontSize - 10
        });
    };

    globalContent() {
        var avgPL = this.props.averagePathLength,
            rad = this.props.radius,
            diam = this.props.diameter,
            avgHC = this.props.averageHarmonicCentrality,
            cluster = this.props.maximumClusterSize;
        return (
            <div>
                Average Harmonic Centrality: <strong>{avgHC.toFixed(3)}</strong>
                <br/>

                Average Path Length: <strong>{avgPL.toFixed(3)}</strong>
                <br/>
                <img  width={`${2*this.state.fontSize}px`}
                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPEAAAAzCAMAAABxNR6EAAAAOVBMVEX///8JCQkYGBgtLS2KiooMDAxAQEAwMDDMzMx0dHS2trYiIiJiYmLm5uaenp4WFhYEBARQUFAAAAAULKwyAAAAAXRSTlMAQObYZgAABK9JREFUaAXtWelirCoM5p6jCAoqvP/D3gSIrDpOp3ZsT/nhAiEkkOWLMnZV0/wqzjflO/bTTSW7Riw9mOXf0hj2cfjV+BpruhHX3zO+0WFcJMrvGV+0sTdi+3vGNzqMi0R57YyttQu1foU3aONFkn4W22F5hZOyVqbzR9XbIe243bMZrB2M/rhck7Uin92tLXaqoMrn5G8yWIlZbT5wize92r4QZDRJR5C665K+h49D2DPzkv09XOaDBLO1Zb2ZaeekFs9ZOpEv6d59UL4Lphlr5wO2TurhyWg2eI6HjA/WvHposU3PDcs6qZ+1ztnZxGxbEeFqdU7wF5ChdslmDD6ytPtdchpwIUvtsyW6N907a5sONxqlnBtP3rOFQuuWZaRrdS9o1lOTK+MEAOD+ruKeN125gyMSbi8W78aGcTjsylZb3QNm+bu6MRpW33Bl4RK1k9r7+TyyHhUpbLXZbeB4R8rGUikpR4UL7TYP9z79SuvpMiGNdYpiDsw5N2YkunChCEQXmdZbN2M8ZDYFxhDceJzQwvV6lBBIsMvuui89zNTh2uKheAxBMdfrgOecBeHYvfWjxt6N9epdImb0O/gx032VcIVPS25r1gAxXW7uKrzZ6OawXcAANmcKcb5a4LLzPMV4yWCWm6LRjbWXmvZjRTLQRfFMa+pmUpHtDEBpxThC6PsUa34G1nuNCdy39Z/QgMvWg6jGaghMzEVeGEc6KVgnUCEwDLRvaKGbASl5PO6RMjDuI/tsdjKVZ/Dw+gysp580BO5bzDHn1E1wqZhBqTcEIgblt25Fcr2G+EXdms0U0bacrX0M8BGwXuRcD+H0M9TbT5qDSfIhDNCbAn5NGcJQOOMoCCYlbB1ZN0Rv9/jad4vzsD79SRPAvZcovc59FnhhKIpLdDx3xmn2ulbe7xIRTJoSP1ccs3G1OcT6zJ0s5wxt/EnjwX09R/SJdG7YGXJOqHMzUMrpKvJ9gCnBjcemm+Qsn3h7DtZHc6Kgki9V5aVxouybEs6t2FYd8RgOI+belMfxc6cG1knZijcB1h9QpKyjxg7cp0PueeEjtbmTivfwFakigo46C1dUnHFvu7J0k4q00SHZyjEt1C7FAqw/oEj5RY0pxaSjDD6TVa2y1WzG/sukWoawT5+NzEJbtJlWFguw/oAiZRU1pjiajjI63/SeEXzdi09gDs3gogn2J38sKJiILbGqqDFC3Ts3g9HRFyUoZoL9KbAUFGKILbGu76PxglI3v35usH6XAreIWtQYwf2dm/sXAsC1FpNg/T5FqlfU2GHhdKh8fm91EypxoWusEmLuAUWqSvxJQzuVjqa1PSFwKupzusvfPMyAL2v1SgGBHFDEOelPmgIbE9EW5UzAXlsHUbz9XsL6kwIl4L45QzRSf5PwDZ0FrD8pQQru45RY23N/trGoj0Rvfypg/Tl52uDe1faaQ/v7By5QwMei/hzfr6FqwvoHSzfBMsxxtT3cw3hS1D9g+LXDJ2B9IdAeuKfavttyQhOMFty+8yvW9poPw38I2BwMpaL+O2t1JHuo7WWslwi2H836AWPRy6mo/wFKHalgCGBuRf0R9U8Y25DdS0V9vhP/AwS/Ls1k0n5JAAAAAElFTkSuQmCC"/>
                <br/>

                Maximum Cluster Size: <strong>{cluster}</strong>
                <br/>

                Diameter: <strong>{diam.toFixed(3)}</strong>
                <br/>
                <img width={`${this.state.fontSize}px`}
                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGwAAAAdBAMAAAC9NpSaAAAAMFBMVEX///8iIiJAQEAMDAx0dHTm5uYwMDDMzMyKiopiYmK2traenp4WFhYEBARQUFAAAABMw5L0AAAAAXRSTlMAQObYZgAAAjVJREFUOBG1Uk1oE0EYfdnu7mSzaVJP6kU2qyLecpK2pyVUVFBY8KAXaZCIQYTuqdeEUsFDD6sUT0WWHrXgnoT2YvQg+EMIhWLAgwsVRJC2KGmFovjNZtJN07ruxQffN9987735YQb4/9CccA/ZC4fcp4Q73he6W93xWzIbKwvddHdsJrOpntCpfljsJrNlezK9zCt9qzePH0t7NBkyXx839ua8WGrPPrg2UQVmSz4u/3I2x3h3+TSOAeyRJxeBd8AcagG1pfccL7li1VGreGany/gI3MVz3ls6D7wFcpKhd4AK2A7y3RtyNsQ5aB1MenILN4EbbkBNpU1pDVgZstAANqA28IJa/RiD1uJrZeZf0x2+28SpdDJsUdRsuMBD5F0MPhvZimRTmiiQ8CQF8q9MB3Q6LAAWt9V8hM/WdzdhSxkoMLAFg9T5OqUPFE2kHeAsJh1lV6Z5H4SNpEc05NhPoobrlMYp2tAoVzHk5zorVPVB2IYDVtBwB1doedkgvkJxHBcoj4OdcjcsqiIs/gjWt59OvcmcuJj9sv4bU6vEXZrwwZ97et6jXKRIjKs9ZTroVUlGyReqFB07OZQRoV38h2fzDKTRSLMsynLUOlApJdOmryLbEcOfjNDfikhRzXhA1sKTA8RfG9ptyc0ERKsG/0pJca+qBxIXa42BDxS/whqrp0zTtPXWwAeKtekjMsLd2I4VK9xPpo3r0Ou8t72fiJ8pFRf4zDVH44WHsDrd7ZB2t/UHlXmFbSrrlPgAAAAASUVORK5CYII="/>
                <br/>

                Radius: <strong>{rad.toFixed(3)}</strong>
                <br/>
                <img width={`${this.state.fontSize}px`}
                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAdBAMAAABF1m9tAAAAMFBMVEX///8MDAy2trYWFhYiIiJQUFCenp7m5uYEBARiYmLMzMxAQEAwMDB0dHSKiooAAADOW4UwAAAAAXRSTlMAQObYZgAAAfpJREFUOBG1Us9LG0EU/hLdTXazmwTBg2BxQfRioaVFqIiQqxUkhf4BS09qRdOr0Kb0IlQa1upRYf8AxdgehOZgThUqpqEXsVbYS/GkqAcjVKFvZh3Z0STsxQ9m573vx05edoD7heby9/9qeor6QZaP/dbIybTcRdukXi/7rdglsVFjWNfK90aOOnyL4CZFUW/XJyR2X3QpIPnH3HdFz/fuwtHizEEFK1fRZ8d7W5wb38AooC9ZZhotNrT4Vt4j4etThgxVmHONCh7l8Anxb9hmTPcu8ARQEkW1BqOKibytMz6ATmg15C08QKSMeRJiBXrMAq8iVTyGkgWmA3a/7ID2HimbhRweMtIknNBay8GBVgRe1gulpVBqsOSiRr4FoMpDA34oMBOddCvkkecjrX4kXSQc4MwPBZ53QnGPVHY/CtAAw4PKfqsMEeoQM5k0BXZoDeM3ELFglqmR0HeafXHZ+3Pg4cXnzXal6wuJewc22MddWbYoJLmbN2+E/FcUIfaEfW16HsIsLLGMX0XZgI2h/HOx7t3o435l3BB3i7elDZwDdOkE6BMxBBjeBx5J9qcNIWoFuKal9iPh9DDHNsymxqB4WFGzfNoFummhMat7IyWaaUy1QmfUjAl+0tpq6AySxXeYYvZUOXwotuNAYdO0uuFD3PmaZmqE/5n0dttGfuSvAAAAAElFTkSuQmCC"/>

            </div>
        );
    }

    getContent() {
        var hCentrality = this.props.harmonicCentrality.toFixed(3),
            ecc = this.props.eccentricity.toFixed(3);

        return (
            <div>
                Selected: <strong>{this.props.vertex.label}</strong>
                <br />

                Harmonic Centrality: <strong>{hCentrality}</strong>
                <br />
                <img src="data:image/png;base64,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"/>
                <br />

                Eccentricity: <strong>{ecc}</strong>
                <br/>
                &epsilon;(v) = Maximum shortest path from <i>v</i>
                {/* // Alternate Markup:
                <dl>
                    <dt>Selected:</dt> <dd>{this.props.vertex.label}</dd>
                    <dt>Harmonic Centrality:</dt> <dd>{hCentrality}</dd>
                    <img src="data:image/png;base64,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"/>
                    <dt>Eccentricity:</dt> <dd>{ecc}</dd>
                    &epsilon;(v) = Maximum shortest path from <i>v</i>
                </dl>
                */}
            </div>
        );
    }

    empty() {
        return <div>No selected vertex</div>;
    }

    render() {
        return (
            <div>
                <div className="card-panel"
                     ref="panel"
                     style={{position: 'absolute',
                             bottom: 50, right: 30,
                             width: this.props.fullWidth, height: this.props.fullHeight,
                             border: '1px solid black',
                             padding: 5,
                             zIndex: 10001,
                             fontSize: `${this.state.fontSize}%`,
                             background: 'rgba(255,255,255,0.5)'}}>
                    {this.globalContent()}
                    <hr/>
                    {this.props.vertex && !this.props.vertex.deleted
                        ? this.getContent() : this.empty()}
                </div>
                <div style={{position: 'absolute',
                             bottom: 40, right: 40,

                             zIndex: 10001}}>
                    {this.state.hidden
                        ? ''
                        : <span>
                            <a href="#" onClick={this.fontPlus}>[font +]</a>
                            &nbsp;
                            <a href="#" onClick={this.fontMinus}>[font -]</a>
                          </span>}
                    &nbsp;
                    {this.state.hidden
                        ? <a href="#" onClick={this.show}>[show]</a>
                        : <a href="#" onClick={this.hide}>[hide]</a>}
                </div>
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
    };

    componentDidUpdate() {
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
                //data={empty}
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
            focussedVertex: null,
            hasUbiquitousVertex: false,
            averagePathLength: NaN,
            diameter: NaN,
            radius: NaN,
            harmonicCentrality: NaN,
            eccentricity: NaN,
            maximumClusterSize: NaN
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
                    //.gravity(0.05)
                    .friction(0.06)
                    .linkDistance(200)
                    .charge(-500);
                break;
        }
        force
            .size([props.width, props.height]);
        return force;
    };

    componentDidMount() {
        this.update();

        // Bind a handler to d3's tick event to update React's representation of d3's state.
        // d3 does not directly handle the DOM.
        this.state.force.on("tick", (tick, b, c) => {
            if (this.state.playing === false)
                return;

            var q = d3.geom.quadtree(this.state.vertices);
            this.state.vertices.forEach((vertex) => q.visit(this.collide(vertex)));
            this.state.vertices.forEach((vertex) => this.forceOntoScreen(vertex));
            // call forceUpdate since we are mutating a property of this.state.
            this.forceUpdate();
        });

        // Bind a resize event handler to resize the SVG element
        $(window).resize(this.resize);

        // Handle messages received over SocketIO
        var m_type = `graph.${this.props.clickerClass}`;
        this.props.socket.on(m_type, message => {
            let data = JSON.parse(message);
            let url = this.props.urls.source;
            //console.log(data.graph, url, data);
            if (url === `/api/graph/${data.graph}/`) {
                switch (data.event_type) {
                case 'add_vertex':
                    this.addVertex({ label: data.label });
                    break;
                case 'add_edge':
                    this.addEdge({ source: data.source, target: data.target });
                    break;
                case 'remove_edge':
                    this.removeEdge({ source: data.source, target: data.target });
                    break;
                case 'label_vertex':
                    this.labelVertex({ index: data.index, label: data.label });
                    break;
                }
            }
        });

         //this.demo4(false);
    }

    componentWillUnmount() {
        $(window).off("resize");
    }

    forceOntoScreen(vertex) {
        // force vertex to render on screen.
        vertex.x = Math.max(vertex.radius, Math.min(getWidth() - vertex.radius, vertex.x));
        vertex.y = Math.max(vertex.radius, Math.min(getHeight() - vertex.radius, vertex.y));
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
                }, true);
            }, i * 500);
        }
    }

    demo4(add) {
        for (let i = 1; i < 40; i++) {
            this.addVertex({ label: `#${this.state.vertices.length}` }, true);
        }
        for (let i = 1; i < 40; i++) {
            let x = Math.floor(Math.random() * (this.state.vertices.length/2));
            let y = Math.floor((1-Math.random()) * (this.state.vertices.length/2));
            this.addEdge({
                source: x,
                target: y
            }, true);
        }
        if (add) {
            setTimeout(this.toggleUbiquitousVertex, 5000);
            setTimeout(this.toggleUbiquitousVertex, 10000);
        }
    }

    update() {
        this.state.vertices.forEach(function (v) {
            v.width = 200;  // width (including margin for collisions)
            v.height = 200; // height (including margin for collisions)
            v.radius = 45; // radius to draw
        });

        this.state.force
            .nodes(this.state.vertices)
            .links(this.state.edges)
            .start();

        if (this.state.playing) {
            this.setState({
                averagePathLength: this.calculateAveragePathLength(),
                diameter: this.calculateDiameter(),
                radius: this.calculateRadius(),
                harmonicCentrality: this.calculateHarmonicCentrality(this.state.focussedVertex),
                eccentricity: this.eccentricity(this.state.focussedVertex),
                averageHarmonicCentrality: this.calculateAverageHarmonicCentrality(),
                maximumClusterSize: this.calculateMaximumClusterSize()
            });
        }
    }

    toggleUbiquitousVertex = () => {
        var v = { label: "John Betts" };
        if (this.state.hasUbiquitousVertex) {
            this.setState({ hasUbiquitousVertex: false });
            this.removeVertex(v);
        } else {
            this.setState({ hasUbiquitousVertex: true });
            let index = this.addVertex(v);
            //console.log(index);
            this.nonDeleted().forEach((vertex) => {
               if (vertex.label !== v.label) {
                   this.addEdge({ source: index, target: vertex.index },
                                true);
               }
            });
        }
    };

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
        //console.log('size');
        this.setState({
            svgHeight: getHeight(),
            svgWidth: getWidth()
        });
        this.state.force
            .size([this.state.svgWidth, this.state.svgHeight])
            .resume();
    };

    addEdge(edge, quiet) {
        if (this.state.edges.filter((e) => {
                return e.source === edge.source && e.target === edge.target
                || ((!this.props.directed)
                    && e.source === edge.target && e.target === edge.source)
        }).length === 0) {
            this.state.edges.push(edge);
            var source = this.state.vertices[edge.source],
                target = this.state.vertices[edge.target];

            if (!quiet)
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

    getColaConstraints() {
        // https://github.com/tgdwyer/WebCola/blob/master/WebCola/examples/pageBoundsConstraints.html
        var constraints = [];
        var i = this.state.vertices.length,
            nodeRadius = 45;
        constraints.push({ axis: 'x', type: 'separation',
            left: tlIndex, right: i, gap: nodeRadius });
        constraints.push({ axis: 'y', type: 'separation',
            left: tlIndex, right: i, gap: nodeRadius });
        constraints.push({ axis: 'x', type: 'separation',
            left: i, right: brIndex, gap: nodeRadius });
        constraints.push({ axis: 'y', type: 'separation',
            left: i, right: brIndex, gap: nodeRadius });
        return constraints;
    }

    addVertex(vertex, quiet) {
        this.state.vertices.push(vertex);
        if (!quiet)
            Materialize.toast(`Added vertex "${vertex.label}"`, 1000, 'green');

        this.update();
        return this.state.vertices.length - 1;
    }

    removeVertex(vertex) {
        // remove vertex
        Materialize.toast(`Removed vertex "${vertex.label}"`, 1000, 'red');

        vertex = this.state.vertices.filter((v) => {
            if (!v.deleted && v.label === vertex.label) {
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
        this.setState({
            focussedVertex: vertex,
            harmonicCentrality: this.calculateHarmonicCentrality(vertex),
            eccentricity: this.eccentricity(vertex)
        });

        this.state.vertices.forEach(v => v.selected = false);
        vertex.selected = true;
    };

    /**
     * Performs a breadth-first search on non-deleted vertices.
     * Applies a .distance and .parent attribute to all vertices in-place,
     * which can be read after the call to bfs().
     * @param x The input vertex
     * @returns {Array} of vertices including {x} that are connected to {x}
     */
    bfs(x) {
        this.nonDeleted().forEach((v) => {
            v.distance = Number.POSITIVE_INFINITY;
            v.parent = null;
        });
        var queue = [],
            component = [];

        //console.log('x.distance', x);
        x.distance = 0;
        queue.unshift(x);
        component.push(x);

        while (queue.length) {
            let u = queue.pop();
            // console.log("visit", u.label);

            this.getAdjacent(u).forEach((v) => {
                // console.log("adjacent", v.label);

                if (v.distance === Number.POSITIVE_INFINITY) {
                    v.distance = u.distance + 1;
                    v.parent = u;
                    queue.unshift(v);
                    component.push(v);
                }
            })
        }
        return component; // array of all connected vertices.
    }

    getConnectedComponents() {
        var components = [];
        var vertices = this.state.vertices;
        var indices = this.nonDeleted().map(v => v.index);
        console.log(indices);
        var iters = 0;
        while (indices.length) {
            //console.log(vertices.length, indices.length);
            iters++; if (iters > 500) break; // avoid infinite recursion...

            var component = this.bfs(vertices[indices[0]]);
            components.push({
                component,
                length: component.length
            });
            component.forEach(v => indices.splice(indices.indexOf(v.index), 1));
        }
        return components;
    }

    calculateMaximumClusterSize() {
        var components = this.getConnectedComponents();
        return Math.max(...components.map(c => c.length));
    }

    calculateHarmonicCentrality(x) {
        if (x === null) return NaN;

        // H(x) = sum_{y!=x} 1 / d(x, y)

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

    calculateAverageHarmonicCentrality() {
        var sum = 0;
        var nodes = this.nonDeleted();
        nodes.map((v) => {
            sum += this.calculateHarmonicCentrality(v);
        });
        return nodes.length ? sum / nodes.length : NaN;
    }

    /**
     * Calculate the eccentricity of a vertex.
     * Eccentricity the the greatest geodesic given a vertex,
     * i.e. The greatest shortest path.
     * @param vertex
     * @returns {*}
     */
    eccentricity(vertex) {
        if (vertex === null) return NaN;
        this.bfs(vertex);
        return Math.max(...this.state.vertices.map((other) => {
            if (vertex.index === other.index)
                return Number.NEGATIVE_INFINITY;
            return other.distance;
        }));
    }

    /**
     * Returns only vertices from {this.state.vertices} that do not
     * have the {.deleted} property set to a !falsey value.
     * @returns {Array} vertices that have not yet been deleted.
     */
    nonDeleted() {
        return this.state.vertices.filter((v) => !v.deleted);
    }

    calculateDiameter() {
        // Maximum Eccentricity (Maximum Maximum Shortest Path)
        return Math.max(...this.nonDeleted().map(this.eccentricity.bind(this)));
    }

    calculateRadius() {
        // Minimum Eccentricity (Minimum Maximum Shortest Path)
        return Math.min(...this.nonDeleted().map(this.eccentricity.bind(this)));
    }

    calculateAveragePathLength() {
        var sum = 0,
            n = this.state.vertices.length;
        this.state.vertices.forEach((outer) => {
            this.bfs(outer);
            this.state.vertices.forEach((inner) => {
                if (inner.index === outer.index)
                    return;
                sum += inner.distance === Number.POSITIVE_INFINITY ? 0 : inner.distance;
            });
        });
        return (1.0 / (n * (n-1))) * sum;
    }

    getAdjacent(vertex) {
        var adj = [];
        this.state.edges.forEach((edge) => {
            if (edge.source.deleted || edge.target.deleted)
                return;

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
                    force={this.state.force}
                    d3Node={vertex}
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
              {<a className='btn'
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '220px',
                    zIndex: '1001 !important'
                   }}
                  href='#' onClick={this.toggleUbiquitousVertex}>
                  {this.state.hasUbiquitousVertex ? "Disconnect" : "Connect"}
              </a>}
              <InfoPanel
                  vertex={this.state.focussedVertex}
                  averagePathLength={this.state.averagePathLength}
                  diameter={this.state.diameter}
                  radius={this.state.radius}
                  harmonicCentrality={this.state.harmonicCentrality}
                  averageHarmonicCentrality={this.state.averageHarmonicCentrality}
                  eccentricity={this.state.eccentricity}
                  maximumClusterSize={this.state.maximumClusterSize} />
              <svg
              style={{border: "0 solid black",
              position: "absolute",
              top: getHeightOffset(),
              left: 0,
              zIndex: 1000 }}
              width={this.state.svgWidth}
              height={this.state.svgHeight}>
                  <filter id="dropshadow" height="130%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                      <feOffset dx="2" dy="2" result="offsetblur"/>
                      <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                  </filter>

                  {this.drawEdges()}
                  {this.drawVertices()}
            </svg>
          </div>
        );
    }
}

window.interactions = $.extend(window.interactions, { Graph });