'use strict';

import $ from 'jquery';
import classNames from 'classnames';
import React from 'react';

class AsyncGameOfLife extends React.Component {

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
                    cells: AsyncGameOfLife.deserialize(data.serialized)
                });
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString());
            }
        });

        window.onbeforeunload = () => {
            this.props.socket.disconnect();
        };

        var m_type = `asyncgameoflife.${this.props.clickerClass}`;
        this.props.socket.on(m_type, message => {
            let data = JSON.parse(message);
            let url = this.props.url.substring(this.props.url.indexOf('/api/'));
            console.log(data.game_of_life, url);
            if (url == data.game_of_life && data.event_type === 'toggle_cell') {
                this.setState({ cells: AsyncGameOfLife.updateCells(this.state.cells, data) });
            }
        });
    }

    componentWillUnmount() {
        console.log('unmount');
        this.props.socket.on(`asyncgameoflife.${this.props.clickerClass}`, $.noop);
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

        var colLetter = AsyncGameOfLife.indexToColumnLetter(y),
            rowNum = x,
            str = `${colLetter}${rowNum + 1}`;

        return Object.keys(this.props.assignments)
            .map(key => this.props.assignments[key].cell_name)
            .filter(val => val == str)
            .length == 0;
    }

    render() {

        return (
            <div>
                <h3>Async. Game of Life</h3>
                <div className="gameOfLife">
                    <div className="golCornerSpacer">&nbsp;</div>

                    {this.state.cells[0].map((_, y) => {
                        return (
                            <div className="golColumnCaption">
                                {AsyncGameOfLife.indexToColumnLetter(y)}
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
                                        <span className={classNames("gol", {
                                            "red lighten-2": !value,
                                            "green darken-2": value
                                        })}>{this.isAI(x,y) ? "Auto" : ""}</span>
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
                                {AsyncGameOfLife.indexToColumnLetter(y)}
                            </div>
                        );
                    })}

                </div>
                <br/>
            </div>
        );
    }

}

window.interactions = window.interactions || {};
window.interactions['AsyncGameOfLife'] = AsyncGameOfLife;