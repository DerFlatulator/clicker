'use strict';

import $ from 'jquery';
import classNames from 'classnames';
import React from 'react';
import Materialize from 'materialize';

class GameOfLife extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            cells: [[true,  false],
                    [false, true ]],
            clientCell: false,
            nextClientCell: false,
            decisionChosen: null,
            buttonEnabled: true,
            assignment: this.props.assignments[this.props.deviceId]
        };
    }

    componentDidMount() {
        console.log('url', this.state.assignment);

        $.ajax({
            url: this.state.assignment.buffer.url,
            dataType: 'json',
            method: 'GET',
            cache: false,
            success: (data) => {
                console.log(data);
                this.setState({
                    clientCell: data.alive,
                    nextClientCell: data.alive
                });
                $.getJSON(data.game_of_life, {}, (gol_data) => {
                    this.setState({ cells: GameOfLife.deserialize(gol_data.serialized) })
                });
            },
            error: (xhr, status, err) => {
                console.error(xhr, status, err.toString());
            }
        });
        var m_type = `gameoflife.${this.props.clickerClass}`;
        this.props.socket.on(m_type, message => {

            let data = JSON.parse(message);
            if (data.game_of_life !== this.props.url)
                return;

            if (data.event_type === 'next_state') {
                console.log(data);

                if (this.state.decisionChosen !== null) {
                    if ('validate' in data && data.validate === 'incorrect') {
                        Materialize.toast("You incorrectly updated your state!", 3000, 'red');
                    } else {
                        Materialize.toast("You correctly updated your state!", 3000, 'green');
                    }
                    if ('vibrate' in navigator)
                        navigator.vibrate([150, 100, 150]);
                } else {
                    Materialize.toast("You missed a state!", 3000, 'orange');
                    if ('vibrate' in navigator)
                        navigator.vibrate([200, 100, 200]);
                }
                this.setState({
                    buttonEnabled: true,
                    decisionChosen: null,
                    clientCell: this.state.nextClientCell,
                    cells: GameOfLife.deserialize(data.serialized)
                });
            }
        })
    }

    /**
     * Deserialize a cell representation
     * @param {string} serial
     * @returns {Array} 2D array of {Boolean} cells
     */
    static deserialize(serial) {
        var rows = serial.split('\n');

        return rows.map(row => {
            return row.split('').map(s => s !== "0");
        });
    }

    isAlive() {
        return this.state.clientCell;
    }

    swap(is_alive) {
        if (!this.state.buttonEnabled || this.decisionIs(is_alive))
            return;

        this.setState({
            buttonEnabled: false,
            decisionChosen: is_alive
        });
        $.ajax({
            url: this.state.assignment.buffer.url,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                alive: is_alive
            }),
            dataType: 'json',
            success: this.swapDone,
            error: (xhr, status, err) => {
                console.error(this.state.assignment.buffer.url, status, err.toString());
            }
        });
    }

    swapDone = ({ alive }) => {
        this.setState({
            buttonEnabled: true,
            nextClientCell: alive
        });
    };

    decisionIs(decision) {
        return (decision === this.state.decisionChosen);
    }

    render() {
        var classes = classNames({
            'disabled': !this.state.buttonEnabled || this.decisionIs(true),
            'green darken-2': true,
            'red darken-2': false
        }, [
            'swapButton', 'waves-effect', 'waves-light', 'btn-large', 'right'
        ]);
        var classes2 = classNames({
            'disabled': !this.state.buttonEnabled || this.decisionIs(false),
            'green darken-2': false,
            'red darken-2': true
        }, [
            'swapButton', 'waves-effect', 'waves-light', 'btn-large', 'left'
        ]);

        var name = this.state.assignment.source.cell_name;

        return (
            <div className="sortPanel">
                <ul className="collapsible popout" data-collapsible="expandable">
                    <li>
                        <div className="collapsible-header active left-align"><i className="material-icons">grid_on</i>
                            Game of Life
                        </div>
                        <div className="collapsible-body">
                            <div className="row">
                                <div className="col s12 l6">
                                    <p className="flow-text left-align">
                                        You're responsible for <strong>cell {name}</strong>,
                                        which is currently <strong className={this.isAlive() ? "green-text" : "red-text"}>
                                        {this.isAlive() ? "alive" : "dead"}</strong>.
                                    </p>
                                </div>
                                <div className="col s12 l6">
                                    <GameOfLifeRepr cell_name={name} cells={this.state.cells} />
                                </div>
                            </div>
                        </div>
                    </li>
                    {/*
                    <li>
                        <div className="collapsible-header active left-align"><i className="material-icons">grid_on</i>
                            Game of Life
                        </div>
                        <div className="collapsible-body">
                            <GameOfLifeRepr cell_name={name} cells={this.state.cells} />
                        </div>
                    </li>
                    */}
                    <li>
                        <div className="collapsible-header active left-align"><i className="material-icons">code</i>
                            Algorithm
                        </div>
                        <div className="row collapsible-body">
                            <div className="col l6 left-align">
                                <div className="algorithm">
                                    {/*<h4>If you're alive...</h4>
                                     <h5>You <span className="red-text">die</span> if the number of
                                     <span className="green-text"> alive </span>
                                     <a href="#neighbours" className="modal-trigger tooltip"
                                     data-tooltip="Click for info"> neighbours</a>
                                     &nbsp;is <strong> more than 3 </strong> (overcrowding)
                                     or <strong> less than 2</strong> (loneliness). Otherwise, stay alive (stasis).</h5> */}
                                    <pre> if cell({name}) is <span className="green-text">alive</span>:</pre>
                                    <pre>   if <span className="green-text">alive_neighbours</span>({name}) &gt; 3:
                                    <br/>     <span className="red-text">die</span>({name}). # Overcrowding</pre>
                                    <pre>   else if <span className="green-text">alive_neighbours</span>({name}) &lt; 2:
                                    <br/>     <span className="red-text">die</span>({name}). # Loneliness</pre>
                                    <pre>   else: <span className="green-text">live</span>({name}). # Stasis </pre>
                                </div>
                            </div>
                            <div className="col l6 left-align">
                                <div className="algorithm">
                                    <pre> if cell({name}) is <span className="red-text">dead</span>:</pre>
                                    <pre>   if <span className="green-text">alive_neighbours</span>({name}) == 3:
                                    <br/>     <span className="green-text">live</span>({name}). # Reproduction</pre>
                                    <pre>   else: <span className="red-text">die</span>({name}). # Stasis </pre>
                                    {/*<h4>If you're dead...</h4>
                                     <h5>You <span className="green-text">live</span> if the number of
                                     <span className="green-text"> alive </span>
                                     <a href="#neighbours" className="modal-trigger tooltip"
                                     data-tooltip="Click for info"> neighbours</a>
                                     &nbsp;is <strong> exactly 3</strong> (reproduction). Otherwise, stay dead (stasis).</h5>*/}
                                </div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="collapsible-header active left-align"><i className="material-icons">input</i>
                            Respond
                        </div>
                        <div className="collapsible-body">
                            <div className="row marginTop">
                                <div className="col s5">
                                    <a onClick={this.swap.bind(this, true)} className={classes}>
                                        <i className="material-icons left">check</i>
                                        { this.isAlive() ? 'Stay Alive' : 'Become Alive' }
                                    </a>
                                </div>
                                <div className="col s2">
                                    <p className="flow-text noMarginTop">OR</p>
                                </div>
                                <div className="col s5">
                                    <a onClick={this.swap.bind(this, false)} className={classes2}>
                                        <i className="material-icons left">close</i>
                                        { this.isAlive() ? 'Die' : 'Stay Dead' }
                                    </a>
                                </div>
                            </div>
                            {this.state.decisionChosen !== null ?
                                <div className="row">
                                    <div className="preloader-wrapper small active">
                                        <div className="spinner-layer spinner-blue-only">
                                            <div className="circle-clipper left">
                                                <div className="circle"></div>
                                            </div><div className="gap-patch">
                                            <div className="circle"></div>
                                        </div><div className="circle-clipper right">
                                            <div className="circle"></div>
                                        </div>
                                        </div>
                                    </div>
                                    <span className="flow-text waiting">Waiting for next state</span>
                                </div>
                                : 'Select an option'}
                        </div>
                    </li>
                </ul>

                <div id="neighbours" className="modal modal-fixed-footer textLeft">
                    <div className="modal-content">
                        <h4>Neighbours</h4>
                        <p>A neighbour is any cell that is next to your cell. This includes diagonals.</p>
                        <ul className="collection">
                            <li className="collection-item">Cells in corners have three neighbours.</li>
                            <li className="collection-item">Cells on an edge have five neighbours.</li>
                            <li className="collection-item">All other cells have a total of eight neighbours.</li>
                        </ul>

                        <div className="row">
                            <div className="col s12 m7">
                                <div className="card max300">
                                    <div className="card-image max300">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Moore_neighborhood_with_cardinal_directions.svg/300px-Moore_neighborhood_with_cardinal_directions.svg.png"></img>
                                    </div>
                                    <div className="card-content">
                                        &quot;<a href="https://commons.wikimedia.org/wiki/File:Moore_neighborhood_with_cardinal_directions.svg#/media/File:Moore_neighborhood_with_cardinal_directions.svg">Moore neighborhood with cardinal directions</a>&quot; by <a href="//commons.wikimedia.org/wiki/User:MorningLemon" title="User:MorningLemon">MorningLemon</a> - <span>Own work</span>. Licensed under <a href="http://creativecommons.org/licenses/by-sa/4.0" title="Creative Commons Attribution-Share Alike 4.0">CC BY-SA 4.0</a> via <a href="https://commons.wikimedia.org/wiki/">Wikimedia Commons</a>.
                                    </div>
                                    <div className="card-action">
                                        <a href="https://en.wikipedia.org/wiki/Moore_neighborhood">Read more on Wikipedia</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Got it!</a>
                    </div>
                </div>
            </div>
        );
    }
}

class GameOfLifeRepr extends React.Component {

    /**
     * @param {number} index the index (0-based) to convert from
     * @returns {string} the column letter
     */
    static indexToColumnLetter(index) {
        return String.fromCharCode("A".charCodeAt(0) + index);
    }

    render() {
        var person = (x, y, val) => {
            var colLetter = GameOfLifeRepr.indexToColumnLetter(y),
                rowNum = x,
                str = `${colLetter}${rowNum + 1}`;

            if (this.props.cell_name === str) {
                return <i className={classNames({
                            dead: !val,
                            "grey-text text-lighten-4": val,
                        }, 'personIcon material-icons')
                }>person</i>;
            } else {
                return <span></span>;
            }
        };

        $(document).ready(function(){
            $('.collapsible').collapsible({
                //accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
            });
        });

        return (
            <div className="gameOfLife col m12">
                <div className="golCornerSpacer">&nbsp;</div>

                {this.props.cells[0].map((_, y) => {
                    return (
                        <div className="golColumnCaption">
                            {GameOfLifeRepr.indexToColumnLetter(y)}
                        </div>
                    );
                })}

                {this.props.cells.map((row, x) => {
                    return (
                        <div className="golRow">
                            <div className="golRowCaption">
                                {x + 1}
                            </div>

                            {row.map((value, y) => {
                                return (
                                    <span className={classNames("gol grey z-depth-1", {
                                        // "red lighten-2": !value,
                                        "darken-2": value,
                                        "lighten-4": !value,
                                        "golAlive": value,
                                        "golDead": !value,
                                        //"red-text text-darken-4": !value,
                                        //"green-text text-darken-4": value
                                    })}>{person(x, y, value)}
                                    </span>
                                );
                            })}

                            <div className="golRowCaption">
                                {x + 1}
                            </div>
                        </div>
                    );
                })}

                <div className="golCornerSpacer">&nbsp;</div>

                {this.props.cells[0].map((_, y) => {
                    return (
                        <div className="golColumnCaption">
                            {GameOfLifeRepr.indexToColumnLetter(y)}
                        </div>
                    );
                })}
            </div>
        );
    }
}

window.interactions = window.interactions || {};
window.interactions['GameOfLife'] = GameOfLife;
