'use strict';

class GameOfLife extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            cells: [[true,  false],
                    [false, true ]],
            buttonEnabled: true
        };
    }

    componentDidMount() {
        this.setState({ indices: [
            this.props.lower_index, this.props.lower_index + 1
        ] });
    }

    isEnabled() {
        // TODO validation

        var columnLetter = this.props.cellName.charAt(0),
            row = parseInt(this.props.cellName.substring(1)) - 1,
            column = columnLetter.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);

        return this.props.cells[row][column];
    }

    swap() {
        this.setState({ buttonEnabled: false });
    }

    swapDone() {
        this.setState({ buttonEnabled: true });
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
                    <i className="mdi-action-swap-horiz left"></i>
                    Die
                </a>
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
        url = "/api/gameoflife/view/#/".replace('#', String(instance));

    React.render(
        <GameOfLife url={url} cellName={cellName} date={new Date()}/>,
        document.getElementById('react-main')
    );
};
run();