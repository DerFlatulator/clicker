'use strict';

var BubbleSort = React.createClass({
    getInitialState() {
        return {
          indices: [0, 1]
        };
    },
    swap(e) {
        $.post('/api/bubblesort/swap/', {
            lower_index: this.state.indices[0],
            bubble_sort: 'http://' + window.location.hostname + '/api/bubblesort/view/1/'
        })
        .then(res => console.log)
        .fail(res => console.error);
    },
    render() {
        return (
            <div>
                <p>
                Press the swap button to switch indicies {this.state.indices[0]} and {this.state.indices[1]}.
                </p>
                <a onClick={this.swap} className="waves-effect waves-light btn-large">
                    <i className="mdi-action-swap-horiz left"></i>
                    Swap!
                </a>
            </div>
        );
    }
});

let run = function () {
    React.render(
        <BubbleSort date={new Date()}/>,
        document.getElementById('react-main')
    );
};
var x = new Promise(function (a) { a(); });
run();