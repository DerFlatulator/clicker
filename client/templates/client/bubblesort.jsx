'use strict';

class BubbleSort extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            indices: [0, 1],
            buttonEnabled: true
        };
    }

    componentDidMount() {
        this.setState({ indices: [
            this.props.lower_index, this.props.lower_index + 1
        ] });
    }

    swap() {
        this.setState({ buttonEnabled: false });
        $.post(this.props.swapURL, {
            lower_index: this.state.indices[0],
            // bubble_sort: '//' + window.location.host + this.props.url
            bubble_sort: this.props.instance
        }, this.swapDone.bind(this)).fail(this.swapDone.bind(this)).always(this.swapDone.bind(this));
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
                <h5>You are responsible for <strong>interval {this.state.indices[0] + 1}</strong>.</h5>
                <a onClick={this.swap.bind(this)} className={classes}>
                    <i className="mdi-action-swap-horiz left"></i>
                    Swap!
                </a>
                <h5>Click SWAP when the number on the <em>left</em> is <strong>greater </strong>
                    than the number on the <em>right</em>.</h5>
            </div>
        );
    }
}

let run = function () {
    $.ajaxSetup({
        beforeSend: req => req.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'))
    });

    var instance = parseInt($.url().param('instance')) || 1,
        lower_index = parseInt($.url().param('lower_index')) || 0,
        url = `/api/bubblesort/${instance}/`,
        swapURL = `${url}swap/`;

    React.render(
        <BubbleSort instance={instance} swapURL={swapURL} lower_index={lower_index} date={new Date()}/>,
        document.getElementById('react-main')
    );
};
run();