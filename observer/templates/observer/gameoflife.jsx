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
                console.log(data.serial_cells);
                this.setState({
                    cells: GameOfLife.deserialize(data.serial_cells)
                });
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString());
            }
        });

        $(function () {
            var socket = io('http://' + window.location.hostname + ':4000');

            socket.on('connect', function () {
                console.log('socket connected');
            });

            socket.on('message', message => {
                console.log(message);
                let data = JSON.parse(message);
                if (this.props.id == data.game_of_life) {
                    this.setState({ cells: GameOfLife.deserialize(data.serial_cells) });
                }
            });
        }.bind(this));
    }

    /**
     * @param index the index (0-based) to convert from
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

    render() {

        return (
            <div>
                <h2>Game of Life</h2>
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
                                        <span className={classNames("gol", {"golDead": !value})}></span>
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

    var socketURL = "//" + window.location.hostname + ":4000/socket.io/socket.io.js",
        instance = parseInt($.url().param('instance')) || 1,
        url = "/api/gameoflife/view/#/".replace('#', String(instance));

    // Wait for socket code to load before activating React
    $.getScript(socketURL, function () {
        React.render(
            <GameOfLife url={url} id={instance} date={new Date()}/>,
            document.getElementById('react-main')
        );
    });

};
run();