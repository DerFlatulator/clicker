'use strict';

class GameOfLife extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            cells: [[true,  false],
                    [false, true ]],
            clientCell: false,
            buttonEnabled: true
        };
    }

    componentDidMount() {
        $.ajax({
            url: this.props.cellURL,
            dataType: 'json',
            cache: false,
            success: data => {
                console.log(data);
                this.setState({
                    clientCell: data.alive
                });
            },
            error: (xhr, status, err) => {
                console.error(this.props.cellURL, status, err.toString());
            }
        });

        $(function () {
            $('.modal-trigger').leanModal();
            $('.tooltip').tooltip({delay: 50});
        }.bind(this));
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

        // TODO validation
        // var index = this.props.cellName.match(/[0-9]/).index,
        //    columnLetter = this.props.cellName.substring(0, index),
        //    row = parseInt(this.props.cellName.substring(index)) - 1,
        //    column = columnLetter.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
        //
        // return this.state.cells[row][column];
    }

    swap() {
        this.setState({ buttonEnabled: false });
        $.ajax({
            url: this.props.cellURL,
            method: 'PATCH',
            data: {
                alive: !this.isAlive()
            },
            dataType: 'json',
            success: this.swapDone.bind(this),
            error: (xhr, status, err) => {
                console.error(this.props.cellURL, status, err.toString());
            }
        });
    }

    swapDone(data) {
        this.setState({
            buttonEnabled: true,
            clientCell: data.alive
        });
    }

    render() {
        var classes = classNames({
            'disabled': !this.state.buttonEnabled,
            'green darken-2': !this.isAlive(),
            'red darken-2': this.isAlive()
        }, [
            'swapButton', 'waves-effect', 'waves-light', 'btn-large'
        ]);

        return (
            <div className="sortPanel">
                <h5>You are responsible for <strong>cell {this.props.cellName}</strong>.</h5>

                <a onClick={this.swap.bind(this)} className={classes}>
                    <i className="mdi-action-invert-colors left"></i>
                    { this.isAlive() ? 'Die' : 'Live' }
                </a>

                {this.isAlive() ? (
                    <h5>Click <span className="red-text">DIE</span> when the number of
                        <span className="green-text"> alive </span>
                        <a href="#neighbours" className="modal-trigger tooltip"
                           data-tooltip="Click for info"> neighbours</a>
                        &nbsp;is <strong> more than 3 </strong>
                        or <strong> less than 2</strong>.</h5>
                ) : (
                    <h5>Click <span className="green-text">LIVE</span> when the number of
                        <span className="green-text"> alive </span>
                        <a href="#neighbours" className="modal-trigger tooltip"
                           data-tooltip="Click for info"> neighbours</a>
                           &nbsp;is <strong> exactly 3</strong>.</h5>
                )}

                <div id="neighbours" className="modal modal-fixed-footer">
                    <div className="modal-content">
                        <h4>Neighbours</h4>
                        <p>A neighbour is any cell that is next to your cell. This includes diagonals.</p>
                        <ul className="collection">
                            <li className="collection-item">Cells in corners have three neighbours.</li>
                            <li className="collection-item">Cells on an edge have five neighbours.</li>
                            <li className="collection-item">All other cells have a total of eight neighbours.</li>
                        </ul>
                    </div>
                    <div className="modal-footer">
                        <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Got it!</a>
                    </div>
                </div>
            </div>
        );
    }
}

let run = function () {
    $.ajaxSetup({
        beforeSend: req => req.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'))
    });

    var instance = parseInt($.url().param('instance')) || 1,
        cellName = $.url().param('cell_name') || "A1",
        url = "/api/gameoflife/#/".replace('#', String(instance)),
        cellURL = url + "cell/#/".replace('#', String(cellName));

    React.render(
        <GameOfLife url={url} cellURL={cellURL} cellName={cellName} date={new Date()}/>,
        document.getElementById('react-main')
    );
};
run();