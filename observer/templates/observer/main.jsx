'use strict';

class BubbleSort extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            list: [1,2,3]
        };
    }

    componentDidMount() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: data => {
                console.log(data.current_list);
                this.setState({
                    list: data.current_list
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
                if (this.props.id == data.bubble_sort) {
                    this.swapListIndex(data.lower_index);
                }
            });
        }.bind(this));
    }

    swapListIndex(index) {
        var list = this.state.list;
        var tmp = list[index];
        list[index] = list[index + 1];
        list[index + 1] = tmp;
        this.setState({ list });
    }

    render() {
        return (
            <div>
                <h2>Bubble Sort</h2>
                <div className="sortList">
                    {this.state.list.map((item, index) => {
                        return (
                            <BubbleSortItem key={item} index={index} item={item}></BubbleSortItem>
                        );
                    })}
                    {this.state.list.map((_, index) => {
                        if (index === 0)
                            return;

                        return (
                            <BubbleSortCaption key={index} index={index}></BubbleSortCaption>
                        );
                    })}

                </div>
            </div>
        );
    }
}

class BubbleSortItem extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            height_multiplier: 20,
            width_multiplier: 44
        };
    }

    render() {
        return (
            <div className="sortItem"
                 style={{
                    height: (this.state.height_multiplier * this.props.item) + 'px',
                    left: (this.state.width_multiplier * this.props.index) + 'px'
                 }}>
                {this.props.item}
            </div>
        );
    }
}

class BubbleSortCaption extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            width_multiplier: 44
        };
    }

    render() {
        return (
            <div className="sortCaption"
                 style={{
                    height: (this.state.height_multiplier) + 'px',
                    left: (this.state.width_multiplier * (this.props.index - 0.5)) + 'px'
                 }}>
                {this.props.index}
            </div>
        );
    }
}

let run = function () {

    var socketURL = "//" + window.location.hostname + ":4000/socket.io/socket.io.js",
        instance = parseInt($.url().param('instance')) || 1,
        url = "/api/bubblesort/view/#/".replace('#', String(instance));

    // Wait for socket code to load before activating React
    $.getScript(socketURL, function () {
        React.render(
            <BubbleSort url={url} id={instance} date={new Date()}/>,
            document.getElementById('react-main')
        );
    });

};
run();