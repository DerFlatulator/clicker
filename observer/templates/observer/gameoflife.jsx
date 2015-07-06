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
        //$.ajax({
        //    url: this.props.url,
        //    dataType: 'json',
        //    cache: false,
        //    success: data => {
        //        console.log(data.current_list);
        //        this.setState({
        //            list: data.current_list
        //        });
        //    },
        //    error: (xhr, status, err) => {
        //        console.error(this.props.url, status, err.toString());
        //    }
        //});
        //
        //$(function () {
        //    var socket = io('http://' + window.location.hostname + ':4000');
        //
        //    socket.on('connect', function () {
        //        console.log('socket connected');
        //    });
        //
        //    socket.on('message', message => {
        //        console.log(message);
        //        let data = JSON.parse(message);
        //        if (this.props.id == data.bubble_sort) {
        //            this.swapListIndex(data.lower_index);
        //        }
        //    });
        //}.bind(this));
    }

    render() {
        return (
            <div>
                <h2>Game of Life</h2>
                <div className="gameOfLife">
                </div>
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