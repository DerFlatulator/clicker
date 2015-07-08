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
        //var columnLetter = this.props.cellName.charAt(0),
        //    row = parseInt(this.props.cellName.substring(1)) - 1,
        //    column = columnLetter.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
        //
        //console.log(this.state.cells[row][column]);
        //
        //return this.state.cells[row][column];
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
            'disabled': !this.state.buttonEnabled
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
                    <h5>Click DIE when the number of <em>alive</em> neighbours is <strong>more than 3 </strong>
                    or <strong>less than 2</strong>.</h5>
                ) : (
                    <h5>Click LIVE when the number of <em>alive</em> neighbours is <strong>exactly 3</strong>.</h5>
                )}
            </div>
        );
    }
}

let run = function () {
    $.ajaxSetup({
        beforeSend: req => req.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'))
    });

    var instance = parseInt($.url().param('instance')) || 1,
        cellName = parseInt($.url().param('cell_name')) || "A1",
        url = "/api/gameoflife/#/".replace('#', String(instance)),
        cellURL = url + "cell/#/".replace('#', String(cellName));

    React.render(
        <GameOfLife url={url} cellURL={cellURL} cellName={cellName} date={new Date()}/>,
        document.getElementById('react-main')
    );
};
run();