'use strict';

class BubbleSort extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
          indices: [0, 1]
        };
    }

    componentDidMount() {
        this.setState({ indices: [
            this.props.lower_index, this.props.lower_index + 1
        ] });
    }

    swap(e) {
        console.log(this);
        $.post(this.props.url, {
            lower_index: this.state.indices[0],
            bubble_sort: 'http://' + window.location.host + '/api/bubblesort/view/1/'
        })
        .then(res => console.log)
        .fail(res => console.error);
    }

    render() {
        return (
            <div>
                <p>
                Press the swap button to switch indicies <strong>{this.state.indices[0]} </strong>
                    and <strong>{this.state.indices[1]}</strong>.
                </p>
                <a onClick={this.swap.bind(this)}
                   className="waves-effect waves-light btn-large">
                    <i className="mdi-action-swap-horiz left"></i>
                    Swap!
                </a>
            </div>
        );
    }
}

let run = function () {
    var lower_index = parseInt($.url().param('lower_index')) || 0;
    React.render(
        <BubbleSort url="/api/bubblesort/swap/" lower_index={lower_index} date={new Date()}/>,
        document.getElementById('react-main')
    );
};
run();