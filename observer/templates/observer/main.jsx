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
                    left: (this.state.width_multiplier * this.props.index) + 'px',
                    display: "inline-block"
                 }}>
                {this.props.item}
            </div>
        );
    }
}

let run = function () {
    var instance = parseInt($.url().param('instance')) || 1,
        url = "/api/bubblesort/view/#/".replace('#', String(instance));

    React.render(
        <BubbleSort url={url} id={instance} date={new Date()}/>,
        document.getElementById('react-main')
    );
};
run();