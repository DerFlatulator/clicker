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
            var path = 'http://#1:4000/#2',
                socket = io(path.replace('#1', window.location.hostname)
                                .replace('#2', String(this.props.channel)));

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

    var socketURL = "//#:4000/socket.io/socket.io.js".replace('#', window.location.hostname),
        instance = parseInt($.url().param('instance')) || 1,
        url = "/api/gameoflife/view/#/".replace('#', String(instance)),
        channel = "gameoflife.observer";

    // Wait for socket code to load before activating React
    $.getScript(socketURL, function () {
        React.render(
            <GameOfLife url={url} channel={channel} id={instance} date={new Date()}/>,
            document.getElementById('react-main')
        );
    });

};
run();