'use strict';

class GameOfLife extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            cells: [[true,  false],
                    [false, true ]]
        };
    }

    componentDidMount() {
        $.ajax({
            url: this.props.url,
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

        $(function () {
            var socket = io(this.props.channel);

            socket.on('connect', function () {
                console.log('socket connected');
            });

            socket.on('message', message => {
                console.log(message);
                let data = JSON.parse(message);
                if (this.props.id == data.game_of_life) {
                    this.setState({ cells: GameOfLife.updateCells(this.state.cells, data) });
                }
            });
        }.bind(this));
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

    render() {

        return (
            <div>
                <h3>Game of Life</h3>
                <div className="gameOfLife">
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

                                {row.map((value) => {
                                    return (
                                        <span className={classNames("gol", {
                                            "red lighten-2": !value,
                                            "green darken-2": value
                                        })}></span>
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
                <br/>
            </div>
        );
    }

}

let run = function () {
    var socketBase = `//${window.location.hostname}:4000/`,
        socketURL = socketBase + 'socket.io/socket.io.js',
        instance = parseInt($.url().param('instance')) || 1,
        url = `/api/gameoflife/${instance}/`,
        channel = socketBase + "gameoflife.observer";

    // Wait for socket code to load before activating React
    $.getScript(socketURL, function () {
        React.render(
            <GameOfLife url={url} channel={channel} id={instance} date={new Date()}/>,
            document.getElementById('react-main')
        );
    });

};
run();