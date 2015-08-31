'use strict';

import $ from 'jquery';
import classNames from 'classnames';
import React from 'react';

class GameOfLife extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            cells: [[true,  false],
                    [false, true ]]
        };
        this.isAI = this.isAI.bind(this);
    }

    componentDidMount() {
        $.ajax({
            url: this.props.url,
            method: 'GET',
            dataType: 'json',
            cache: false,
            success: data => {
                this.setState({
                    cells: GameOfLife.deserialize(data.serialized)
                });
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString());
            }
        });

        window.onbeforeunload = () => {
            this.props.socket.disconnect();
        };

        var m_type = `gameoflife.${this.props.clickerClass}`;
        this.props.socket.on(m_type, message => {
            let data = JSON.parse(message);
            let url = this.props.url.substring(this.props.url.indexOf('/api/'));
            console.log(data.game_of_life, url);
            if (url == data.game_of_life && data.event_type === 'toggle_cell') {
                this.setState({
                    cells: GameOfLife.updateCells(this.state.cells, data)
                });
            }
        });
    }

    componentWillUnmount() {
        console.log('unmount');
        this.props.socket.on(`gameoflife.${this.props.clickerClass}`, $.noop);
    }

    /**
     * @param {number} index the index (0-based) to convert from
     * @returns {string} the column letter
     */
    static indexToColumnLetter(index) {
        return String.fromCharCode("A".charCodeAt(0) + index);
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

    static updateCells(cells, data) {
        // {"game_of_life": 3, "col": 0, "alive": false, "row": 3}
        var newCells = $.extend(true, [], cells);
        if (data.col < cells[0].length && data.row < cells.length) {
            newCells[data.row][data.col] = data.alive;
        } else {
            //var oneRow = new Array(Math.max(cells[0].length, data.col));
            //var numRows = Math.max(cells.length, data.row);
            //for (let i = 0; i < numRows; i++) {
            //    newCells.push($.extend(true, [], oneRow));
            //}
            //// TODO update, etc
            //// ...
        }
        return newCells;
    }

    isAI(x, y) {

        var colLetter = GameOfLife.indexToColumnLetter(y),
            rowNum = x,
            str = `${colLetter}${rowNum + 1}`;

        return Object.keys(this.props.assignments)
            .map(key => this.props.assignments[key].source.cell_name)
            .filter(val => val == str)
            .length == 0;
    }

    nextIteration = () => {
        $.post(this.props.urls.next_state, data => {
            $.get(this.props.url, data => {
                this.setState({
                    cells: GameOfLife.deserialize(data.serialized)
                });
            })
        });
    };

    render() {
        var classes = classNames([
            'waves-effect', 'waves-light', 'btn', 'blue'
        ]);

        var personOrAI = (x, y, val) => {
            return <i className={classNames({
                                                dead: !val,
                                                androidIcon: this.isAI(x,y),
                                                personIcon: !this.isAI(x,y)
                                            }, 'material-icons')
                                }>{this.isAI(x,y) ? '' : 'person'}</i>;
        };

        return (
            <div>
                <h3>Game of Life</h3>
                <div className="row">
                    <div className="gameOfLife col m8">
                        <div className="golCornerSpacer">&nbsp;</div>

                        {this.state.cells[0].map((_, y) => {
                            return (
                                <div className="golColumnCaption">
                                    {GameOfLife.indexToColumnLetter(y)}
                                </div>
                            );
                        })}

                        {this.state.cells.map((row, x) => {
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
                                            })}>{personOrAI(x,y,value)}
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

                        {this.state.cells[0].map((_, y) => {
                            return (
                                <div className="golColumnCaption">
                                    {GameOfLife.indexToColumnLetter(y)}
                                </div>
                            );
                        })}

                    </div>
                    <div className="col m4">
                        {/* Next iteration button */}
                        <a onClick={this.nextIteration} className={classes}>
                            <i className="material-icons right">navigate_next</i>
                            Next State
                        </a>
                    </div>
                </div>

                <br/>
            </div>
        );
    }

}

window.interactions = $.extend(window.interactions, { GameOfLife });